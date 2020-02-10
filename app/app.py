# Python standard libraries
import json
import os
import sqlite3

# Third-party libraries
from flask import Flask, redirect, request, url_for, jsonify, render_template
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient
import requests

# Internal imports
# DB
from db.db import init_db_command
from models.user import User
from models.organization import Organization
# Security
import security.auth as security
# Objects
from lib.contribution_organizer import ContributionOrganizer

# Configuration
# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive']
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

autInstance = security.auth(SCOPES)
credentials = autInstance.get_credentials()
organizer = ContributionOrganizer(credentials)


# Flask app setup
app = Flask(__name__,
            static_url_path='',
            static_folder='web/static',
            template_folder='web/templates')

app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)

# Naive database setup
try:
    init_db_command()
except sqlite3.OperationalError:
    # Assume it's already been created
    pass

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


@app.route("/")
def index():
    if current_user.is_authenticated:
        return render_template('index.html', name=current_user.name.title(),
                               email=current_user.email, profile_pic=current_user.profile_pic)
    else:
        return render_template('login.html')


@app.route("/login")
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@app.route("/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")
    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    # Create a user in your db with the information provided
    # by Google
    user = User(
        id_=unique_id, name=users_name, email=users_email, profile_pic=picture
    )

    # Doesn't exist? Add it to the database.
    if not User.get(unique_id):
        User.create(unique_id, users_name, users_email, picture)

    # Begin user session by logging the user in
    login_user(user)

    # Send user back to homepage
    return redirect(url_for("index"))


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route("/api/v1.0.0/org", methods=['POST'])
def create_group():
    if not request.json:
        abort(400)

    Organization.create(request.json['name'], request.json['description'])

    return 'Created', 201


@app.route("/api/v1.0.0/org/<org_id>")
def get_group(org_id):
    org = Organization.get(org_id)
    return jsonify({'org': org.toJSON()})


@app.route("/api/v1.0.0/topic", methods=['POST'])
def add_topic():

    if not current_user:
        abort(401)

    if not request.json:
        abort(400)

    folder = organizer.getTopics().createTopic(
        request.json['name'], current_user.email)

    return jsonify({'topic': folder})


@app.route("/api/v1.0.0/topics")
def get_topics():

    if not current_user:
        abort(401)

    topics = organizer.getTopics().getTopicsForUser(current_user.email)

    return jsonify({'topics': topics})


@app.route("/api/v1.0.0/contribution", methods=['POST'])
def add_contribution():
    print('Assigned to Mok')
    # TODO Sequence:
    # Add file to specific topic
    # check if user has access
    # allow user to access specific topic
    # save contribution data to database


@app.route("/api/v1.0.0/contribution/<topic_id>")
def get_contribution(topic_id):
    if not current_user:
        abort(401)

    if not topic_id:
        abort(400)

    contributions = organizer.getTopics(
    ).getContributions().getContributionsForTopic(topic_id)

    return jsonify({'contributions': contributions})


if __name__ == "__main__":
    # app.run(ssl_context="adhoc", host="0.0.0.0", port="443") # Docker variation

    app.run(ssl_context="adhoc")

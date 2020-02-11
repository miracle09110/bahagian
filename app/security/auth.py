from __future__ import print_function
import pickle
import os.path
import json

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request


class auth:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/drive']
        self.discovery_url = (
            "https://accounts.google.com/.well-known/openid-configuration"
        )
        self.google_client_id = ""
        self.google_client_secret = ""

    def get_credentials(self):
        creds = None
        pickle_path = './security/token.pickle'
        credentials_path = './security/credentials.json'

        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        with open(credentials_path) as json_file:
            data = json.load(json_file)
            self.google_client_id = data['installed']['client_id']
            self.google_client_secret = data['installed']['client_secret']

        if os.path.exists(pickle_path):
            with open(pickle_path, 'rb') as token:
                creds = pickle.load(token)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, self.SCOPES)
                creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open(pickle_path, 'wb') as token:
                pickle.dump(creds, token)

        return creds

    def get_google_client_id(self):
        return self.google_client_id

    def get_google_client_secret(self):
        return self.google_client_secret

    def get_discovery_url(self):
        return self.discovery_url

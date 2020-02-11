from googleapiclient.discovery import build
from lib.topic_recorder import TopicRecorder
from werkzeug.utils import secure_filename


class ContributionOrganizer:

    # Main storage = 11-Azuq1tnMPQnKy6XnJohmKenR3qxSTM
    # OrganizationId = "1NMGZGGnBJJB8ORhjZkhxygva_BnZ0pj6"

    def __init__(self, _credentials):
        self.credentials = _credentials
        self.drive = build('drive', 'v3', credentials=_credentials)
        self.topics = TopicRecorder(
            self.drive, "1NMGZGGnBJJB8ORhjZkhxygva_BnZ0pj6")

    def getDrive(self):
        return self.drive

    def getTopics(self):
        return self.topics

    def addContributionToTopic(self, topic_id, file):
        # Hi MARC
        # TODO Sequence:
        # Add file to specific topic
        # check if user has access
        # allow user to access specific topic
        # save contribution data to database
        filename = secure_filename(
            file.filename)  # Creates a valid file name to avoid scripting
        print('Does nothing yet')

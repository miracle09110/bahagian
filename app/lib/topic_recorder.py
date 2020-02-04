
from lib.contribution_recorder import ContributionRecorder


class TopicRecorder:

    def __init__(self, drive, organizationId):
        self.organizationId = organizationId
        self.drive = drive
        self.contributions = ContributionRecorder(drive)

    def getContributions(self):
        return self.contributions

    def getTopicsInOrganization(self):
        results = self.drive.files().list(
            q="'" + self.organizationId + "' in parents", fields="files(id, name)").execute()

        items = results.get('files', [])
        return items

    def getTopicsWithUserAccess(self, user_email):
        results = self.drive.files().list(
            q="'" + user_email + "' in writers and '" +
            self.organizationId + "' in parents",
            fields="files(id, name)").execute()

        items = results.get('files', [])
        return items

    def getTopicsForUser(self, user_email):
        topics = []
        all_topics = self.getTopicsInOrganization()
        authorized_topics = self.getTopicsWithUserAccess(user_email)

        for item in all_topics:
            authorized = False

            if item in authorized_topics:
                authorized = True

            topic = {
                'topic': item,
                'authorized': authorized
            }

            topics.append(topic)

        return topics

    def createTopic(self, name, email):
        metadata = {
            'name': name,
            'parents': [self.organizationId],
            'mimeType': 'application/vnd.google-apps.folder'
        }

        folder = self.drive.files().create(
            body=metadata, fields="id").execute()

        if not folder.get('id'):
            abort(400)

        user_permission = self.addWritePermission(folder.get('id'), email)

        if not user_permission.get('id'):
            abort(400)

        return folder

    def addWritePermission(self, fileId, email):
        user_permission = {
            'type': 'user',
            'role': 'writer',
            'emailAddress': email
        }

        permission = self.drive.permissions().create(
            fileId=fileId,
            body=user_permission,
            fields='id'
        ).execute()

        return permission

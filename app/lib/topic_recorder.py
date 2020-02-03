
class TopicRecorder:

    def __init__(self, drive, organizationId):
        self.organizationId = organizationId
        self.drive = drive

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

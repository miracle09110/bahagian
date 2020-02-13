from apiclient.http import MediaFileUpload


class ContributionRecorder:
    def __init__(self, drive):
        self.drive = drive

    def getContributionsForTopic(self, topicId):
        results = self.drive.files().list(
            q="'" + topicId + "' in parents", fields="files(id, name)").execute()

        contributions = results.get('files', [])

        return contributions

    def addContribution(self, filepath, mimetype, file_metadata):
        media = MediaFileUpload(filepath, mimetype=mimetype)
        file = self.drive.files().create(
            body=file_metadata, media_body=media, fields='id').execute()

        return file.get('id')

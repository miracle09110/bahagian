
class ContributionRecorder:
    def __init__(self, drive):
        self.drive = drive

    def getContributionsForId(self, topicId):
        results = self.drive.files().list(
            q="'" + topicId + "' in parents", fields="files(id, name)").execute()

        contributions = results.get('files', [])

        return contributions

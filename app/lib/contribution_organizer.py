from googleapiclient.discovery import build


class ContributionOrganizer:
    def __init__(self, _credentials):
        self.credentials = _credentials
        self.drive = build('drive', 'v3', credentials=_credentials)

    def getDrive(self):
        return self.drive

    def printFiles(self):
        results = self.drive.files().list(
            pageSize=10, fields="nextPageToken, files(id, name)").execute()
        items = results.get('files', [])

        if not items:
            print('No files found.')
        else:
            print('Files:')
            for item in items:
                print(u'{0} ({1})'.format(item['name'], item['id']))

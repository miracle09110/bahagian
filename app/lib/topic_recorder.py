
from lib.contribution_recorder import ContributionRecorder
from werkzeug.utils import secure_filename
import magic

google_file_conversion_dictionary = {
    'application/msword': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}


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

    def addContributionToTopic(self, user, topic_id, file_path, file):

        filename = secure_filename(file.filename)
        path_to_save_file = file_path / filename

        if path_to_save_file.exists():
            path_to_save_file.unlink()

        if not file_path.exists():
            file_path.mkdir()

        file.save(path_to_save_file)

        file_metadata = {
            'name': filename,
            'parents': [topic_id]
        }

        mime_type = magic.from_file(
            str(path_to_save_file.resolve()), mime=True)

        if mime_type in google_file_conversion_dictionary:
            file_metadata['mimeType'] = google_file_conversion_dictionary[mime_type]

        generated_id = self.contributions.addContribution(
            path_to_save_file, mime_type, file_metadata)

        path_to_save_file.unlink()

        if generated_id is not None:
            self.addWritePermission(topic_id, user)
            return 'OK', 201

        else:
            abort(500)

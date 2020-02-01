from flask_login import UserMixin

from db.db import get_db

id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  file TEXT NOT NULL,
  topic_id  INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,


class Contribution(UserMixin):
    def __init__(self, id_, email, file, topic_id, timestamp):
        self.id = id_
        self.email = email
        self.file = file
        self.topic_id = topic_id
        self.timestamp = timestamp

    @staticmethod
    def get(contribution_id):
        db = get_db()
        contribution = db.execute(
            "SELECT * FROM contribution WHERE id = ?", (contribution_id,)
        ).fetchone()
        if not contribution:
            return None

        contribution = Contribution(
            id_=contribution[0], email=contribution[1], file=contribution[2], topic_id=contribution[3], timestamp=contribution[4]
        )
        return contribution

    @staticmethod
    def getContributions(email, topic_id):
        db = get_db()
        contributions = db.execute(
            "SELECT * FROM contribution WHERE topic_id = ? and email = ?", (topic_id, email)
        ).fetchAll()
        if not contributions.len() == 0:
            return None
        else:
            userContributions = []
            for contribution in topics:
                contribution = Contribution(
                    id_=contribution[0], email=contribution[1], file=contribution[2], topic_id=contribution[3], timestamp=contribution[4]
                ) 

                userContributions.append(contribution)
            
            return userContributions


    @staticmethod
    def create(email, file, topic_id,):
        db = get_db()
        db.execute(
            "INSERT INTO contribution (email, file, topic_id) "
            "VALUES (?, ?, ?)",
            (email, file, topic_id),
        )
        db.commit()
    
    def toJSON(self):
        contribution = {
            'id' : self.id,
            'email' : self.email,
            'file' : self.file,
            'topic_id' : self.topic_id,
            'timestamp' : self.timestamp
        }

        return contribution
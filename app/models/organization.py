from flask_login import UserMixin

from db.db import get_db


class Organization(UserMixin):
    def __init__(self, id_, name, description):
        self.id = id_
        self.name = name
        self.description = description

    @staticmethod
    def get(org_id):
        db = get_db()
        org = db.execute(
            "SELECT * FROM organization WHERE id = ?", (org_id,)
        ).fetchone()
        if not org:
            return None

        org = Organization(
            id_=org[0], name=org[1], description=org[2]
        )
        return org

    @staticmethod
    def create(name, description):
        db = get_db()
        db.execute(
            "INSERT INTO organization(name, description) "
            " VALUES (?, ?)",
            (name, description),
        )
        db.commit()

    def toJSON(self):
        org = {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

        return org

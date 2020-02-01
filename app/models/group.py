from flask_login import UserMixin

from db.db import get_db

class Group(UserMixin):
    def __init__(self, id_, name, description):
        self.id = id_
        self.name = name
        self.description = description

    @staticmethod
    def get(group_id):
        db = get_db()
        group = db.execute(
            "SELECT * FROM user WHERE id = ?", (group_id,)
        ).fetchone()
        if not group:
            return None

        group = Group(
            id_=group[0], name=group[1], description=group[2]
        )
        return group

    @staticmethod
    def create(name, description):
        db = get_db()
        db.execute(
            "INSERT INTO group (name, description) "
            "VALUES (?, ?)",
            (name, description),
        )
        db.commit()
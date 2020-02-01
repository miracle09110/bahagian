from flask_login import UserMixin

from db.db import get_db

class Topic(UserMixin):
    def __init__(self, id_, name, description, group_id):
        self.id = id_
        self.name = name
        self.description = description
        self.group_id = group_id

    @staticmethod
    def get(topic_id):
        db = get_db()
        topic = db.execute(
            "SELECT * FROM topic WHERE id = ?", (topic_id,)
        ).fetchone()
        if not topic:
            return None

        topic = Topic(
            id_=topic[0], name=topic[1], description=topic[2], group_id=topic[3]
        )
        return topic

    @staticmethod
    def getTopics(group_id):
        db = get_db()
        topics = db.execute(
            "SELECT * FROM topic WHERE group_id = ?", (group_id,)
        ).fetchAll()
        if not topics.len() == 0:
            return None
        else:
            relatedTopics = []
            for unparsedTopic in topics:
                topic = Topic(
                    id_=unparsedTopic[0], name=unparsedTopic[1], description=unparsedTopic[2], group_id=unparsedTopic[3]
                ) 

                relatedTopics.append(topic)
            
            return relatedTopics


    @staticmethod
    def create(name, description, group_id):
        db = get_db()
        db.execute(
            "INSERT INTO topic (name, description, group_id) "
            "VALUES (?, ?, ?)",
            (name, description, group_id),
        )
        db.commit()
    

from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry

from backend.courses.models import Course
from .models import Forum, Thread, Post


@registry.register_document
class ForumDocument(Document):
    class Index:
        name = "forums"

    course = fields.ObjectField(
        properties={
            "title": fields.TextField(),
        }
    )
    title = fields.TextField()
    description = fields.TextField()

    class Django:
        model = Forum
        related_models = [Course, Thread, Post]

        fields = [
            "id",
            "created_at",
        ]


@registry.register_document
class ThreadDocument(Document):
    class Index:
        name = "threads"

    forum = fields.ObjectField(
        properties={
            "title": fields.TextField(),
            "course": fields.ObjectField(
                properties={
                    "title": fields.TextField(),
                }
            ),
        }
    )
    title = fields.TextField()

    class Django:
        model = Thread
        related_models = [Forum, Post]

        fields = [
            "id",
            "created_by",
            "created_at",
        ]


@registry.register_document
class PostDocument(Document):
    class Index:
        name = "posts"

    thread = fields.ObjectField(
        properties={
            "title": fields.TextField(),
            "forum": fields.ObjectField(
                properties={
                    "title": fields.TextField(),
                    "course": fields.ObjectField(
                        properties={
                            "title": fields.TextField(),
                        }
                    ),
                }
            ),
        }
    )
    content = fields.TextField()
    author = fields.ObjectField(
        properties={
            "username": fields.TextField(),
        }
    )

    class Django:
        model = Post

        fields = [
            "id",
            "created_at",
        ]

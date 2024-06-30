from django.apps import AppConfig

class ReviewConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.reviews"

    def ready(self):
        from . import signals
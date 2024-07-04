from django.apps import AppConfig

class QuizzesConfig(AppConfig):
    name = 'quizzes'

    def ready(self):
        from . import signals
        signals.setup_firestore_listeners()
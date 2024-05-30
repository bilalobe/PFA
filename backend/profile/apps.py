from django.apps import AppConfig

class YourAppNameConfig(AppConfig):
    name = 'your_app_name'

    def ready(self):
        import app.signals

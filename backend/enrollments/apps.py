from django.apps import AppConfig


class EnrollmentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "enrollment"

    def ready(self):
        import enrollment.signals  # Import your signals

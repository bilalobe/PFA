from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Cleans up old data"

    def handle(self, *args, **options):
        # Your cleanup code here
        self.stdout.write(self.style.SUCCESS("Successfully cleaned up old data"))

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a default superuser for local development if one does not already exist."

    def handle(self, *args, **options):
        User = get_user_model()
        username = "admin"
        password = "AdminPass123!"
        email = "admin@example.com"

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING("Superuser 'admin' already exists."))
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(
            self.style.SUCCESS(
                "Created superuser 'admin' with password 'AdminPass123!'. Change this password immediately."
            )
        )

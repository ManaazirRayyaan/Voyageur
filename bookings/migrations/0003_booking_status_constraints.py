from django.db import migrations, models
from django.db.models import Q


def migrate_booking_statuses(apps, schema_editor):
    Booking = apps.get_model("bookings", "Booking")
    Booking.objects.filter(status="confirmed").update(status="booked")
    Booking.objects.filter(status="pending").update(status="booked")


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0002_trip"),
    ]

    operations = [
        migrations.RunPython(migrate_booking_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="booking",
            name="status",
            field=models.CharField(
                choices=[("booked", "Booked"), ("completed", "Completed"), ("cancelled", "Cancelled")],
                default="booked",
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.UniqueConstraint(
                condition=Q(package__isnull=False, status="booked"),
                fields=("user", "package"),
                name="unique_active_package_booking_per_user",
            ),
        ),
    ]

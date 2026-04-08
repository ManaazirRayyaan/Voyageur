from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("bookings", "0003_booking_status_constraints"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]

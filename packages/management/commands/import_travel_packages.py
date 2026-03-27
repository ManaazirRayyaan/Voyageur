import json
from pathlib import Path

from django.core.management.base import BaseCommand

from packages.models import Destination, Package


class Command(BaseCommand):
    help = "Import the 100-package JSON travel dataset into Destination and Package models."

    def handle(self, *args, **options):
        data_path = Path(__file__).resolve().parents[2] / "fixtures" / "travel_packages.json"
        with data_path.open("r", encoding="utf-8") as file_handle:
            payload = json.load(file_handle)

        created_count = 0
        updated_count = 0

        for item in payload:
            external_id = item["id"]
            from_location = item["from"].strip()
            to_location = item["to"].strip()
            category = item["category"].strip()
            vibe = item["vibe"].strip()

            destination_name, country = self._split_destination(to_location)
            destination, _ = Destination.objects.get_or_create(
                name=destination_name,
                country=country,
                defaults={
                    "description": f"Imported destination for {to_location} travel packages.",
                    "latitude": 0,
                    "longitude": 0,
                },
            )

            package_defaults = {
                "title": f"{to_location} {vibe} Escape",
                "destination": destination,
                "description": (
                    f"Imported package route from {from_location} to {to_location}. "
                    f"Category: {category}. Vibe: {vibe}."
                ),
                "price": 0,
                "duration_days": 3 + (external_id % 6),
                "rating": round(3.8 + (external_id % 6) * 0.2, 1),
                "category": category,
                "vibe": vibe,
                "from_location": from_location,
                "to_location": to_location,
                "flight_cost": item["flight"],
                "hotel_cost": item["hotel"],
                "food_cost": item["food"],
                "activities_cost": item["activities"],
                "taxi_cost": item["taxi"],
                "is_featured": external_id <= 8,
                "is_popular": external_id <= 12,
            }

            package, created = Package.objects.update_or_create(
                source_external_id=external_id,
                defaults=package_defaults,
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported travel packages successfully. Created: {created_count}, Updated: {updated_count}"
            )
        )

    def _split_destination(self, to_location):
        if "," in to_location:
            name, country = [part.strip() for part in to_location.rsplit(",", 1)]
            return name, country
        return to_location, "Unknown"

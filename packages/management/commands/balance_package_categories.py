from decimal import Decimal

from django.core.management.base import BaseCommand

from packages.category_utils import TARGET_CATEGORIES, normalize_package_category
from packages.models import Destination, Package


CURATED_PACKAGES = [
    {
        "title": "Goa Budget Coastline",
        "destination": "Goa",
        "country": "India",
        "category": Package.BUDGET,
        "duration_days": 4,
        "price": Decimal("320.00"),
        "rating": 4.2,
        "vibe": "Budget",
        "description": "Beachside stays, scooter-ready routes, and cost-smart coastal travel.",
        "from_location": "Mumbai",
        "latitude": 15.2993,
        "longitude": 74.1240,
    },
    {
        "title": "Hanoi Budget Discovery",
        "destination": "Hanoi",
        "country": "Vietnam",
        "category": Package.BUDGET,
        "duration_days": 5,
        "price": Decimal("410.00"),
        "rating": 4.3,
        "vibe": "Budget",
        "description": "Street food, walkable stays, and affordable city exploration.",
        "from_location": "Bangkok",
        "latitude": 21.0278,
        "longitude": 105.8342,
    },
    {
        "title": "Tbilisi Smart Escape",
        "destination": "Tbilisi",
        "country": "Georgia",
        "category": Package.BUDGET,
        "duration_days": 4,
        "price": Decimal("470.00"),
        "rating": 4.4,
        "vibe": "Budget",
        "description": "Old town alleys, local cuisine, and wallet-friendly boutique stays.",
        "from_location": "Istanbul",
        "latitude": 41.7151,
        "longitude": 44.8271,
    },
    {
        "title": "Krakow Budget City Break",
        "destination": "Krakow",
        "country": "Poland",
        "category": Package.BUDGET,
        "duration_days": 3,
        "price": Decimal("290.00"),
        "rating": 4.1,
        "vibe": "Budget",
        "description": "Compact heritage travel with practical stays and easy transport.",
        "from_location": "Prague",
        "latitude": 50.0647,
        "longitude": 19.9450,
    },
    {
        "title": "Lisbon Budget Weekender",
        "destination": "Lisbon",
        "country": "Portugal",
        "category": Package.BUDGET,
        "duration_days": 4,
        "price": Decimal("480.00"),
        "rating": 4.3,
        "vibe": "Budget",
        "description": "Tram rides, scenic districts, and practical boutique lodging.",
        "from_location": "Madrid",
        "latitude": 38.7223,
        "longitude": -9.1393,
    },
    {
        "title": "Rome Cultural Heritage Tour",
        "destination": "Rome",
        "country": "Italy",
        "category": Package.CULTURAL,
        "duration_days": 6,
        "price": Decimal("1180.00"),
        "rating": 4.7,
        "vibe": "Cultural",
        "description": "Classical landmarks, artisan districts, and guided heritage routes.",
        "from_location": "Paris",
        "latitude": 41.9028,
        "longitude": 12.4964,
    },
    {
        "title": "Istanbul Ottoman Heritage Trail",
        "destination": "Istanbul",
        "country": "Turkey",
        "category": Package.CULTURAL,
        "duration_days": 5,
        "price": Decimal("1240.00"),
        "rating": 4.6,
        "vibe": "Cultural",
        "description": "Mosques, bazaars, Bosphorus views, and deep historical context.",
        "from_location": "Athens",
        "latitude": 41.0082,
        "longitude": 28.9784,
    },
    {
        "title": "Marrakech Medina Culture Stay",
        "destination": "Marrakech",
        "country": "Morocco",
        "category": Package.CULTURAL,
        "duration_days": 5,
        "price": Decimal("980.00"),
        "rating": 4.5,
        "vibe": "Cultural",
        "description": "Riads, souks, and guided storytelling across the medina.",
        "from_location": "Madrid",
        "latitude": 31.6295,
        "longitude": -7.9811,
    },
    {
        "title": "Cusco Inca Legacy Journey",
        "destination": "Cusco",
        "country": "Peru",
        "category": Package.CULTURAL,
        "duration_days": 6,
        "price": Decimal("1320.00"),
        "rating": 4.8,
        "vibe": "Cultural",
        "description": "Sacred valley context, local guides, and heritage-led city pacing.",
        "from_location": "Lima",
        "latitude": -13.5319,
        "longitude": -71.9675,
    },
    {
        "title": "Seville Flamenco Heritage Week",
        "destination": "Seville",
        "country": "Spain",
        "category": Package.CULTURAL,
        "duration_days": 5,
        "price": Decimal("1090.00"),
        "rating": 4.6,
        "vibe": "Cultural",
        "description": "Courtyard hotels, old quarter walks, and performance-led evenings.",
        "from_location": "Barcelona",
        "latitude": 37.3891,
        "longitude": -5.9845,
    },
    {
        "title": "Prague Old Town Culture Loop",
        "destination": "Prague",
        "country": "Czech Republic",
        "category": Package.CULTURAL,
        "duration_days": 5,
        "price": Decimal("990.00"),
        "rating": 4.5,
        "vibe": "Cultural",
        "description": "Castle district walks, classical cafés, and guided heritage pacing.",
        "from_location": "Vienna",
        "latitude": 50.0755,
        "longitude": 14.4378,
    },
    {
        "title": "Varanasi Sacred Ganges Journey",
        "destination": "Varanasi",
        "country": "India",
        "category": Package.RELIGIOUS,
        "duration_days": 5,
        "price": Decimal("840.00"),
        "rating": 4.7,
        "vibe": "Religious",
        "description": "Temple visits, ghat ceremonies, and guided spiritual heritage stops.",
        "from_location": "Delhi",
        "latitude": 25.3176,
        "longitude": 82.9739,
    },
    {
        "title": "Amritsar Golden Temple Retreat",
        "destination": "Amritsar",
        "country": "India",
        "category": Package.RELIGIOUS,
        "duration_days": 4,
        "price": Decimal("760.00"),
        "rating": 4.8,
        "vibe": "Religious",
        "description": "Sacred-site planning with smooth transfers and reflective pacing.",
        "from_location": "Mumbai",
        "latitude": 31.6340,
        "longitude": 74.8723,
    },
    {
        "title": "Madinah Spiritual City Stay",
        "destination": "Madinah",
        "country": "Saudi Arabia",
        "category": Package.RELIGIOUS,
        "duration_days": 5,
        "price": Decimal("1190.00"),
        "rating": 4.9,
        "vibe": "Religious",
        "description": "Comfort-led spiritual travel with curated logistics and city access.",
        "from_location": "Dubai",
        "latitude": 24.5247,
        "longitude": 39.5692,
    },
    {
        "title": "Jerusalem Holy City Pilgrimage",
        "destination": "Jerusalem",
        "country": "Israel",
        "category": Package.RELIGIOUS,
        "duration_days": 6,
        "price": Decimal("1410.00"),
        "rating": 4.8,
        "vibe": "Religious",
        "description": "Old city landmarks, guided sacred routes, and heritage-focused stays.",
        "from_location": "Athens",
        "latitude": 31.7683,
        "longitude": 35.2137,
    },
    {
        "title": "Bodh Gaya Buddhist Peace Trail",
        "destination": "Bodh Gaya",
        "country": "India",
        "category": Package.RELIGIOUS,
        "duration_days": 4,
        "price": Decimal("680.00"),
        "rating": 4.7,
        "vibe": "Religious",
        "description": "Meditation spaces, temple circuits, and a calm spiritual itinerary.",
        "from_location": "Kolkata",
        "latitude": 24.6959,
        "longitude": 84.9910,
    },
]


class Command(BaseCommand):
    help = "Normalize all packages into the six supported categories and top up low categories to a minimum of 15."

    def handle(self, *args, **options):
        normalized_count = 0
        for package in Package.objects.select_related("destination").all():
            normalized_category = normalize_package_category(
                package.category,
                package.vibe,
                package.destination.name,
                package.total_cost or package.price,
            )
            if package.category != normalized_category:
                package.category = normalized_category
                package.save(update_fields=["category"])
                normalized_count += 1

        counts = {category: Package.objects.filter(category=category).count() for category in TARGET_CATEGORIES}
        created_titles = []

        for spec in CURATED_PACKAGES:
            category = spec["category"]
            if counts[category] >= 15:
                continue

            destination, _ = Destination.objects.get_or_create(
                name=spec["destination"],
                country=spec["country"],
                defaults={
                    "description": spec["description"],
                    "latitude": spec["latitude"],
                    "longitude": spec["longitude"],
                },
            )

            package, created = Package.objects.get_or_create(
                title=spec["title"],
                defaults=self._build_package_defaults(spec, destination),
            )
            if created:
                created_titles.append(package.title)
                counts[category] += 1

        final_counts = {category: Package.objects.filter(category=category).count() for category in TARGET_CATEGORIES}
        total = Package.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Balanced package categories. Normalized: {normalized_count}, Added: {len(created_titles)}, Total: {total}, Counts: {final_counts}"
            )
        )

    def _build_package_defaults(self, spec, destination):
        total = Decimal(spec["price"])
        flight = (total * Decimal("0.28")).quantize(Decimal("0.01"))
        hotel = (total * Decimal("0.34")).quantize(Decimal("0.01"))
        food = (total * Decimal("0.14")).quantize(Decimal("0.01"))
        activities = (total * Decimal("0.16")).quantize(Decimal("0.01"))
        taxi = total - flight - hotel - food - activities
        return {
            "destination": destination,
            "description": spec["description"],
            "price": total,
            "duration_days": spec["duration_days"],
            "rating": spec["rating"],
            "category": spec["category"],
            "vibe": spec["vibe"],
            "from_location": spec["from_location"],
            "to_location": f"{destination.name}, {destination.country}",
            "flight_cost": flight,
            "hotel_cost": hotel,
            "food_cost": food,
            "activities_cost": activities,
            "taxi_cost": taxi,
            "is_featured": False,
            "is_popular": False,
        }

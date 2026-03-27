from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from bookings.models import Booking
from packages.models import Destination, Hotel, Package, Transport
from reviews.models import Review


class Command(BaseCommand):
    help = "Seed the Travel Planner project with realistic destinations, packages, hotels, transports, bookings, and reviews."

    def handle(self, *args, **options):
        transports = {
            "flight": Decimal("620.00"),
            "train": Decimal("180.00"),
            "bus": Decimal("90.00"),
            "car": Decimal("240.00"),
        }
        transport_objs = {}
        for transport_type, price in transports.items():
            transport_objs[transport_type], _ = Transport.objects.get_or_create(type=transport_type, defaults={"price": price})

        destinations_data = [
            ("Santorini", "Greece", "Luxury caldera views and romantic sailing experiences.", 36.3932, 25.4615),
            ("Bali", "Indonesia", "Wellness resorts, surf culture, and curated island escapes.", -8.4095, 115.1889),
            ("Kyoto", "Japan", "Temples, ryokans, and culture-led city itineraries.", 35.0116, 135.7681),
            ("Dubai", "UAE", "High-end urban stays, shopping, and desert experiences.", 25.2048, 55.2708),
        ]

        destination_objs = {}
        for name, country, description, lat, lng in destinations_data:
            destination_objs[name], _ = Destination.objects.get_or_create(
                name=name,
                country=country,
                defaults={"description": description, "latitude": lat, "longitude": lng},
            )

        hotel_specs = [
            ("Ocean Crest Suite", "Santorini", "540.00", 4.9),
            ("Azure Dome Retreat", "Santorini", "410.00", 4.7),
            ("Lotus Tide Resort", "Bali", "320.00", 4.6),
            ("Ubud Canopy Villas", "Bali", "280.00", 4.5),
            ("Gion Heritage Stay", "Kyoto", "350.00", 4.8),
            ("Marina Grand Tower", "Dubai", "430.00", 4.7),
        ]
        hotel_objs = {}
        for name, destination_name, price, rating in hotel_specs:
            hotel_objs[name], _ = Hotel.objects.get_or_create(
                name=name,
                destination=destination_objs[destination_name],
                defaults={"price_per_night": Decimal(price), "rating": rating},
            )

        package_specs = [
            {
                "title": "Santorini Sunset Escape",
                "destination": "Santorini",
                "description": "A premium romance itinerary with sailing, tasting menus, and cliffside suites.",
                "price": Decimal("2490.00"),
                "duration_days": 6,
                "rating": 4.9,
                "category": Package.LUXURY,
                "is_featured": True,
                "is_popular": True,
                "hotels": ["Ocean Crest Suite", "Azure Dome Retreat"],
                "transports": ["flight", "car"],
            },
            {
                "title": "Bali Retreat Builder",
                "destination": "Bali",
                "description": "A flexible island package optimized for custom upgrades and curated experiences.",
                "price": Decimal("1690.00"),
                "duration_days": 7,
                "rating": 4.7,
                "category": Package.ADVENTURE,
                "is_featured": True,
                "is_popular": True,
                "hotels": ["Lotus Tide Resort", "Ubud Canopy Villas"],
                "transports": ["flight", "car"],
            },
            {
                "title": "Kyoto Heritage Journey",
                "destination": "Kyoto",
                "description": "Culture-first package with temples, tea ceremonies, and premium ryokan options.",
                "price": Decimal("1890.00"),
                "duration_days": 5,
                "rating": 4.8,
                "category": Package.CULTURAL,
                "is_featured": True,
                "is_popular": False,
                "hotels": ["Gion Heritage Stay"],
                "transports": ["flight", "train"],
            },
            {
                "title": "Dubai Luxe Week",
                "destination": "Dubai",
                "description": "Skyline hospitality, private transfers, and desert-driven premium experiences.",
                "price": Decimal("2290.00"),
                "duration_days": 5,
                "rating": 4.6,
                "category": Package.LUXURY,
                "is_featured": False,
                "is_popular": True,
                "hotels": ["Marina Grand Tower"],
                "transports": ["flight", "car"],
            },
        ]

        package_objs = {}
        for spec in package_specs:
            package, created = Package.objects.get_or_create(
                title=spec["title"],
                defaults={
                    "destination": destination_objs[spec["destination"]],
                    "description": spec["description"],
                    "price": spec["price"],
                    "duration_days": spec["duration_days"],
                    "rating": spec["rating"],
                    "category": spec["category"],
                    "is_featured": spec["is_featured"],
                    "is_popular": spec["is_popular"],
                },
            )
            if created:
                package.hotels.set([hotel_objs[name] for name in spec["hotels"]])
                package.transports.set([transport_objs[name] for name in spec["transports"]])
            package_objs[spec["title"]] = package

        traveler, created = User.objects.get_or_create(
            username="demo_traveler",
            defaults={"first_name": "Demo", "last_name": "Traveler", "email": "demo@example.com"},
        )
        if created:
            traveler.set_password("StrongPass123")
            traveler.save()

        reviews = [
            ("Santorini", 5, "Booking and destination quality both felt premium end to end."),
            ("Bali", 5, "The custom trip flow made hotel and activity selection very easy."),
            ("Kyoto", 4, "Great itinerary pacing and clear package inclusions."),
        ]
        for destination_name, rating, comment in reviews:
            Review.objects.get_or_create(
                user=traveler,
                destination=destination_objs[destination_name],
                comment=comment,
                defaults={"rating": rating},
            )

        Booking.objects.get_or_create(
            reference="VYG-DEMOBOOK1",
            defaults={
                "user": traveler,
                "package": package_objs["Santorini Sunset Escape"],
                "destination": destination_objs["Santorini"],
                "hotel": hotel_objs["Ocean Crest Suite"],
                "transport": transport_objs["flight"],
                "travelers": 2,
                "start_date": "2026-06-14",
                "end_date": "2026-06-20",
                "total_price": Decimal("7300.00"),
                "trip_type": Booking.PACKAGE,
                "status": Booking.CONFIRMED,
            },
        )

        self.stdout.write(self.style.SUCCESS("Seed data created or already present."))

from datetime import date

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from packages.models import Destination, Hotel, Package, Transport

from .models import Booking


class BookingFlowTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="traveler", password="StrongPass123")
        self.destination = Destination.objects.create(
            name="Bali",
            country="Indonesia",
            description="Island destination",
            latitude=-8.4,
            longitude=115.1,
        )
        self.hotel = Hotel.objects.create(
            name="Lotus Tide Resort",
            destination=self.destination,
            price_per_night="300.00",
            rating=4.6,
        )
        self.transport = Transport.objects.create(type=Transport.FLIGHT, price="500.00")
        self.package = Package.objects.create(
            title="Bali Escape",
            destination=self.destination,
            description="Beach package",
            price="1500.00",
            duration_days=5,
            rating=4.5,
            category=Package.ADVENTURE,
        )
        self.package.hotels.add(self.hotel)
        self.package.transports.add(self.transport)

    def test_login_required_for_booking(self):
        response = self.client.get(reverse("bookings:create_booking", args=[self.package.slug]))
        self.assertEqual(response.status_code, 302)

    def test_booking_creation_and_download(self):
        self.client.login(username="traveler", password="StrongPass123")
        response = self.client.post(
            reverse("bookings:create_booking", args=[self.package.slug]),
            {
                "hotel": self.hotel.id,
                "transport": self.transport.id,
                "travelers": 2,
                "start_date": date(2026, 6, 14),
                "end_date": date(2026, 6, 20),
            },
        )
        booking = Booking.objects.get(user=self.user)
        self.assertRedirects(response, reverse("bookings:confirmation", args=[booking.reference]))

        download = self.client.get(reverse("bookings:download_itinerary", args=[booking.reference]))
        self.assertEqual(download.status_code, 200)
        self.assertIn("attachment;", download["Content-Disposition"])

import json
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

    def test_booking_requires_authentication(self):
        response = self.client.post(
            reverse("api-book"),
            data=json.dumps({
                "package_id": self.package.id,
                "hotel_id": self.hotel.id,
                "transport_id": self.transport.id,
                "travelers": 2,
                "start_date": "2026-06-14",
                "end_date": "2026-06-20",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_booking_creation_and_invoice_download(self):
        login_response = self.client.post(
            reverse("api-login"),
            data=json.dumps({"identifier": "traveler", "password": "StrongPass123"}),
            content_type="application/json",
        )
        access = login_response.json()["access"]
        response = self.client.post(
            reverse("api-book"),
            data=json.dumps({
                "package_id": self.package.id,
                "hotel_id": self.hotel.id,
                "transport_id": self.transport.id,
                "travelers": 2,
                "start_date": date(2026, 6, 14).isoformat(),
                "end_date": date(2026, 6, 20).isoformat(),
            }),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        booking = Booking.objects.get(user=self.user)
        self.assertEqual(response.status_code, 201)

        download = self.client.get(
            reverse("api-invoice", args=[booking.id]),
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(download.status_code, 200)
        self.assertIn("attachment;", download["Content-Disposition"])

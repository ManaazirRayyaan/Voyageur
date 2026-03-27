from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from packages.models import Destination

from .models import Review


class ReviewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="reviewer", password="StrongPass123")
        self.destination = Destination.objects.create(
            name="Kyoto",
            country="Japan",
            description="Historic destination",
            latitude=35.0,
            longitude=135.7,
        )

    def test_review_requires_authentication(self):
        response = self.client.post(
            reverse("reviews:create_generic"),
            {"destination": self.destination.id, "rating": 5, "comment": "Excellent."},
        )
        self.assertEqual(response.status_code, 302)

    def test_authenticated_review_submission(self):
        self.client.login(username="reviewer", password="StrongPass123")
        response = self.client.post(
            reverse("reviews:create_generic"),
            {"destination": self.destination.id, "rating": 5, "comment": "Excellent."},
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Review.objects.count(), 1)

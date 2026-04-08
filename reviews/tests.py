import json

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
            reverse("api-reviews"),
            data=json.dumps({"destination_id": self.destination.id, "rating": 5, "comment": "Excellent."}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_authenticated_review_submission(self):
        login_response = self.client.post(
            reverse("api-login"),
            data=json.dumps({"identifier": "reviewer", "password": "StrongPass123"}),
            content_type="application/json",
        )
        access = login_response.json()["access"]
        response = self.client.post(
            reverse("api-reviews"),
            data=json.dumps({"destination_id": self.destination.id, "rating": 5, "comment": "Excellent."}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Review.objects.count(), 1)

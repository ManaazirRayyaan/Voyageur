import json

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse


class UserFlowTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_user_registration_creates_profile(self):
        response = self.client.post(
            reverse("api-register"),
            data=json.dumps({
                "name": "Test User",
                "username": "testuser",
                "email": "test@example.com",
                "password": "ComplexPass123",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="testuser").exists())
        self.assertTrue(hasattr(User.objects.get(username="testuser"), "profile"))

    def test_login_accepts_username_and_email(self):
        user = User.objects.create_user(username="traveler1", email="traveler1@example.com", password="StrongPass123")

        username_response = self.client.post(
            reverse("api-login"),
            data=json.dumps({"identifier": "traveler1", "password": "StrongPass123"}),
            content_type="application/json",
        )
        self.assertEqual(username_response.status_code, 200)

        email_response = self.client.post(
            reverse("api-login"),
            data=json.dumps({"identifier": "traveler1@example.com", "password": "StrongPass123"}),
            content_type="application/json",
        )
        self.assertEqual(email_response.status_code, 200)
        self.assertTrue(User.objects.filter(pk=user.pk).exists())

    def test_profile_update_supports_personal_fields(self):
        user = User.objects.create_user(username="profileuser", email="profile@example.com", password="StrongPass123")
        login_response = self.client.post(
            reverse("api-login"),
            data=json.dumps({"identifier": "profileuser", "password": "StrongPass123"}),
            content_type="application/json",
        )
        access = login_response.json()["access"]
        response = self.client.put(
            reverse("api-profile-update"),
            data=json.dumps({
                "name": "Profile User",
                "username": "profileuser",
                "email": "profile@example.com",
                "age": 29,
                "gender": "female",
                "phone": "9999999999",
                "current_password": "",
                "new_password": "",
            }),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.profile.age, 29)
        self.assertEqual(user.profile.gender, "female")
        self.assertEqual(user.profile.phone, "9999999999")

    def test_username_suggestions_api_returns_alternatives(self):
        User.objects.create_user(username="voyageur", password="StrongPass123")
        response = self.client.get(reverse("api-username-suggestions"), {"username": "voyageur"})
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertFalse(payload["available"])
        self.assertGreaterEqual(len(payload["suggestions"]), 1)

from django.contrib.auth.models import User
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.urls import reverse


class UserFlowTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_user_registration_creates_profile(self):
        response = self.client.post(
            reverse("users:register"),
            {
                "first_name": "Test",
                "last_name": "User",
                "username": "testuser",
                "email": "test@example.com",
                "password1": "ComplexPass123",
                "password2": "ComplexPass123",
            },
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(username="testuser").exists())
        self.assertTrue(hasattr(User.objects.get(username="testuser"), "profile"))

    def test_login_accepts_username_and_email(self):
        user = User.objects.create_user(username="traveler1", email="traveler1@example.com", password="StrongPass123")

        username_response = self.client.post(
            reverse("users:login"),
            {"username": "traveler1", "password": "StrongPass123"},
        )
        self.assertEqual(username_response.status_code, 302)

        self.client.logout()

        email_response = self.client.post(
            reverse("users:login"),
            {"username": "traveler1@example.com", "password": "StrongPass123"},
        )
        self.assertEqual(email_response.status_code, 302)

        self.assertTrue(User.objects.filter(pk=user.pk).exists())

    def test_profile_update_supports_personal_fields(self):
        user = User.objects.create_user(username="profileuser", email="profile@example.com", password="StrongPass123")
        self.client.login(username="profileuser", password="StrongPass123")
        response = self.client.post(
            reverse("users:profile_settings"),
            {
                "full_name": "Profile User",
                "username": "profileuser",
                "email": "profile@example.com",
                "age": 29,
                "gender": "Female",
                "phone": "9999999999",
                "new_password1": "",
                "new_password2": "",
            },
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.profile.age, 29)
        self.assertEqual(user.profile.gender, "Female")
        self.assertEqual(user.profile.phone, "9999999999")

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_sends_email(self):
        User.objects.create_user(username="mailer", email="mailer@example.com", password="StrongPass123")
        response = self.client.post(reverse("users:forgot_password"), {"email": "mailer@example.com"})
        self.assertRedirects(response, reverse("users:password_reset_done"))
        self.assertEqual(len(mail.outbox), 1)

    def test_back_button_not_on_homepage_but_present_elsewhere(self):
        home_response = self.client.get(reverse("dashboard:home"))
        self.assertNotContains(home_response, "Back</span>", status_code=200)

        login_response = self.client.get(reverse("users:login"))
        self.assertContains(login_response, 'class="back-button"', status_code=200)

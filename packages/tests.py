from django.test import Client, TestCase
from django.urls import reverse

from .models import Destination, Package


class PackageApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.destination = Destination.objects.create(
            name="Santorini",
            country="Greece",
            description="Cliffside destination",
            latitude=36.3,
            longitude=25.4,
        )
        self.package = Package.objects.create(
            title="Santorini Sunset Escape",
            destination=self.destination,
            description="Luxury package",
            price="2490.00",
            duration_days=6,
            rating=4.8,
            category=Package.LUXURY,
        )

    def test_package_search_filters_by_title(self):
        response = self.client.get(reverse("api-packages"), {"query": "Santorini"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["title"], self.package.title)

    def test_package_detail_returns_json(self):
        response = self.client.get(reverse("api-package-detail", args=[self.package.pk]))
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["destination"], self.package.destination.name)
        self.assertEqual(payload["id"], self.package.pk)

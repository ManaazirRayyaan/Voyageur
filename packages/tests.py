from django.test import Client, TestCase
from django.urls import reverse

from .models import Destination, Package


class PackageViewsTests(TestCase):
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
        response = self.client.get(reverse("packages:list"), {"q": "Santorini"})
        self.assertContains(response, self.package.title)

    def test_package_detail_renders(self):
        response = self.client.get(reverse("packages:detail", args=[self.package.slug]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.package.destination.name)

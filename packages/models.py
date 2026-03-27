from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.template.defaultfilters import slugify


class Destination(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=200)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(upload_to="destinations/", blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}, {self.country}"


class Hotel(models.Model):
    name = models.CharField(max_length=255)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="hotels")
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        ordering = ["-rating", "price_per_night"]

    def __str__(self):
        return self.name


class Transport(models.Model):
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"
    TYPE_CHOICES = [
        (FLIGHT, "Flight"),
        (TRAIN, "Train"),
        (BUS, "Bus"),
        (CAR, "Car"),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["price"]

    def __str__(self):
        return f"{self.get_type_display()} - {self.price}"


class Package(models.Model):
    ADVENTURE = "adventure"
    FAMILY = "family"
    LUXURY = "luxury"
    BUDGET = "budget"
    CULTURAL = "cultural"
    RELIGIOUS = "religious"
    CATEGORY_CHOICES = [
        (ADVENTURE, "Adventure"),
        (FAMILY, "Family"),
        (LUXURY, "Luxury"),
        (BUDGET, "Budget"),
        (CULTURAL, "Cultural"),
        (RELIGIOUS, "Religious"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="packages")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    category = models.CharField(max_length=50, default=LUXURY)
    vibe = models.CharField(max_length=100, blank=True)
    from_location = models.CharField(max_length=255, blank=True)
    to_location = models.CharField(max_length=255, blank=True)
    flight_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hotel_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    food_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    activities_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    taxi_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    source_external_id = models.PositiveIntegerField(null=True, blank=True, unique=True)
    cover_image = models.ImageField(upload_to="packages/", blank=True)
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    itinerary = models.JSONField(default=list, blank=True)
    included_items = models.JSONField(default=list, blank=True)
    excluded_items = models.JSONField(default=list, blank=True)
    restaurants = models.JSONField(default=list, blank=True)
    hotels = models.ManyToManyField(Hotel, blank=True, related_name="packages")
    transports = models.ManyToManyField(Transport, blank=True, related_name="packages")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-rating", "price"]
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["vibe"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Package.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        if not self.itinerary:
            self.itinerary = [
                {"title": "Arrival and check-in", "description": "Private transfer and hotel check-in."},
                {"title": "Signature local experience", "description": "Curated activity with guide support."},
            ]
        if not self.included_items:
            self.included_items = ["Accommodation", "Selected experiences", "Support assistance"]
        if not self.excluded_items:
            self.excluded_items = ["International airfare", "Personal expenses"]
        if not self.restaurants:
            self.restaurants = ["Local tasting menu", "Signature sunset dinner"]
        self.total_cost = (
            Decimal(self.flight_cost or 0)
            + Decimal(self.hotel_cost or 0)
            + Decimal(self.food_cost or 0)
            + Decimal(self.activities_cost or 0)
            + Decimal(self.taxi_cost or 0)
        )
        if self.total_cost:
            self.price = self.total_cost
        if not self.to_location and self.destination_id:
            self.to_location = str(self.destination)
        super().save(*args, **kwargs)

    @property
    def estimated_total(self):
        return self.total_cost or (self.price + Decimal("230.00"))

    @property
    def category_label(self):
        return self.category.replace("/", " / ").replace("-", " ").title()

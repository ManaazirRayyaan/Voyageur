from decimal import Decimal
import uuid
from django.utils import timezone

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from packages.models import Destination, Hotel, Package, Transport


class Booking(models.Model):
    BOOKED = "booked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (BOOKED, "Booked"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
    ]
    PACKAGE = "package"
    CUSTOM = "custom"
    TRIP_TYPE_CHOICES = [
        (PACKAGE, "Package"),
        (CUSTOM, "Custom"),
    ]

    reference = models.CharField(max_length=24, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    destination = models.ForeignKey(
        Destination, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    transport = models.ForeignKey(
        Transport, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    travelers = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default=PACKAGE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=BOOKED)
    custom_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "package"],
                condition=Q(status="booked", package__isnull=False),
                name="unique_active_package_booking_per_user",
            )
        ]

    def __str__(self):
        return self.reference

    def clean(self):
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date.")
        if self.travelers < 1:
            raise ValidationError("At least one traveler is required.")
        if self.trip_type == self.PACKAGE and not self.package:
            raise ValidationError("Package bookings must include a package.")
        if self.trip_type == self.CUSTOM and not self.destination:
            raise ValidationError("Custom trips must include a destination.")
        if self.hotel and self.destination and self.hotel.destination_id != self.destination_id:
            raise ValidationError("Selected hotel does not match the chosen destination.")
        if self.package:
            duplicate_qs = Booking.objects.filter(user=self.user, package=self.package, status=self.BOOKED)
            if self.pk:
                duplicate_qs = duplicate_qs.exclude(pk=self.pk)
            if duplicate_qs.exists():
                raise ValidationError("You have already booked this package.")

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"VYG-{uuid.uuid4().hex[:10].upper()}"
        if self.package and not self.destination:
            self.destination = self.package.destination
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def nights(self):
        return max((self.end_date - self.start_date).days, 1)

    def calculate_total(self):
        package_cost = self.package.price if self.package else Decimal("0.00")
        hotel_cost = (self.hotel.price_per_night * self.nights) if self.hotel else Decimal("0.00")
        transport_cost = self.transport.price if self.transport else Decimal("0.00")
        subtotal = package_cost + hotel_cost + transport_cost
        return subtotal * self.travelers

    @property
    def is_ongoing(self):
        today = timezone.localdate()
        return self.start_date <= today <= self.end_date and self.status == self.BOOKED


class Trip(Booking):
    class Meta:
        proxy = True
        verbose_name = "Trip"
        verbose_name_plural = "Trips"

from django.contrib import admin

from .models import Booking, Trip


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "trip_type", "destination", "travelers", "total_price", "status", "created_at")
    list_filter = ("status", "trip_type", "created_at")
    search_fields = ("reference", "user__username", "destination__name", "package__title")


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "destination", "start_date", "end_date", "status")
    list_filter = ("status", "trip_type")
    search_fields = ("reference", "user__username", "package__title", "destination__name")

from django.contrib import admin

from .models import Destination, Hotel, Package, Transport


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "latitude", "longitude")
    search_fields = ("name", "country")


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("name", "destination", "price_per_night", "rating")
    list_filter = ("destination",)


@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    list_display = ("type", "price")
    list_filter = ("type",)


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "from_location",
        "to_location",
        "destination",
        "category",
        "vibe",
        "total_cost",
        "duration_days",
        "rating",
        "is_featured",
        "is_popular",
    )
    list_filter = ("category", "is_featured", "is_popular", "destination")
    search_fields = ("title", "destination__name", "from_location", "to_location", "vibe")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("hotels", "transports")

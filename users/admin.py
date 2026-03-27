from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone

from bookings.models import Trip

from .models import Profile, Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "package", "created_at")
    search_fields = ("user__username", "package__title", "package__to_location")
    list_filter = ("created_at",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "user__email", "phone")


admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "email",
        "is_staff",
        "bookings_total",
        "ongoing_trips_total",
        "wishlist_total",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_staff", "is_superuser", "is_active")

    def get_queryset(self, request):
        today = timezone.localdate()
        return (
            super()
            .get_queryset(request)
            .annotate(
                bookings_count=Count("bookings", distinct=True),
                ongoing_count=Count(
                    "bookings",
                    filter=Q(bookings__start_date__lte=today, bookings__end_date__gte=today, bookings__status="confirmed"),
                    distinct=True,
                ),
                wishlist_count=Count("wishlist_items", distinct=True),
            )
        )

    @admin.display(ordering="bookings_count", description="Booked Packages")
    def bookings_total(self, obj):
        return obj.bookings_count

    @admin.display(ordering="ongoing_count", description="Ongoing Trips")
    def ongoing_trips_total(self, obj):
        return obj.ongoing_count

    @admin.display(ordering="wishlist_count", description="Wishlist Items")
    def wishlist_total(self, obj):
        return obj.wishlist_count

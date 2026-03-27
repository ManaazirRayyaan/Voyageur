from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from bookings.models import Booking
from packages.models import Destination, Package
from reviews.models import Review
from users.models import Wishlist


def home(request):
    context = {
        "featured_packages": Package.objects.select_related("destination").filter(is_featured=True)[:6],
        "popular_packages": Package.objects.select_related("destination").filter(is_popular=True)[:6],
        "top_destinations": Destination.objects.all()[:4],
        "latest_reviews": Review.objects.select_related("user", "destination")[:3],
    }
    return render(request, "dashboard/home.html", context)


@login_required
def user_dashboard(request):
    profile = request.user.profile
    context = {
        "bookings": Booking.objects.select_related("package", "destination", "hotel").filter(user=request.user)[:8],
        "saved_packages": profile.saved_packages.select_related("destination")[:6],
        "wishlist_items": Wishlist.objects.select_related("package", "package__destination").filter(user=request.user)[:6],
        "profile": profile,
    }
    return render(request, "dashboard/user_dashboard.html", context)

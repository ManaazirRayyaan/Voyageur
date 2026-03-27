from django.urls import path

from bookings.api_views import BookingListAPIView, BookingCreateAPIView, InvoiceAPIView
from packages.api_views import PackageDetailAPIView, PackageListAPIView
from reviews.api_views import ReviewListCreateAPIView
from users.api_views import (
    LoginAPIView,
    LogoutAPIView,
    ProfileAPIView,
    ProfileUpdateAPIView,
    RegisterAPIView,
    UsernameSuggestionAPIView,
    WishlistAddAPIView,
    WishlistListAPIView,
    WishlistRemoveAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="api-register"),
    path("login/", LoginAPIView.as_view(), name="api-login"),
    path("logout/", LogoutAPIView.as_view(), name="api-logout"),
    path("profile/", ProfileAPIView.as_view(), name="api-profile"),
    path("profile/update/", ProfileUpdateAPIView.as_view(), name="api-profile-update"),
    path("username-suggestions/", UsernameSuggestionAPIView.as_view(), name="api-username-suggestions"),
    path("packages/", PackageListAPIView.as_view(), name="api-packages"),
    path("packages/<int:pk>/", PackageDetailAPIView.as_view(), name="api-package-detail"),
    path("wishlist/", WishlistListAPIView.as_view(), name="api-wishlist"),
    path("wishlist/add/", WishlistAddAPIView.as_view(), name="api-wishlist-add"),
    path("wishlist/remove/", WishlistRemoveAPIView.as_view(), name="api-wishlist-remove"),
    path("book/", BookingCreateAPIView.as_view(), name="api-book"),
    path("bookings/", BookingListAPIView.as_view(), name="api-bookings"),
    path("invoice/<int:booking_id>/", InvoiceAPIView.as_view(), name="api-invoice"),
    path("reviews/", ReviewListCreateAPIView.as_view(), name="api-reviews"),
]

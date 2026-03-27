from django.urls import path

from .views import confirmation, create_booking, custom_trip_builder, download_itinerary

app_name = "bookings"

urlpatterns = [
    path("custom-trip/", custom_trip_builder, name="custom_trip"),
    path("package/<slug:slug>/", create_booking, name="create_booking"),
    path("confirmation/<str:reference>/", confirmation, name="confirmation"),
    path("confirmation/<str:reference>/download/", download_itinerary, name="download_itinerary"),
]

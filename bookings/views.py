from datetime import datetime
import json
import subprocess
import tempfile
from pathlib import Path

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from packages.models import Destination, Package

from .forms import BookingForm, CustomTripForm
from .models import Booking


@login_required
def create_booking(request, slug):
    package = get_object_or_404(Package.objects.select_related("destination"), slug=slug)
    form = BookingForm(request.POST or None, package=package)
    if request.method == "POST" and form.is_valid():
        booking = form.save(commit=False)
        booking.user = request.user
        booking.total_price = booking.calculate_total()
        booking.save()
        messages.success(request, "Your booking has been confirmed.")
        return redirect("bookings:confirmation", reference=booking.reference)

    return render(request, "bookings/create_booking.html", {"package": package, "form": form})


@login_required
def custom_trip_builder(request):
    form = CustomTripForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        booking = form.save(commit=False)
        booking.user = request.user
        booking.total_price = booking.calculate_total()
        booking.save()
        messages.success(request, "Custom trip saved successfully.")
        return redirect("bookings:confirmation", reference=booking.reference)

    context = {
        "form": form,
        "destinations": Destination.objects.all()[:6],
    }
    return render(request, "bookings/custom_trip.html", context)


@login_required
def confirmation(request, reference):
    booking = get_object_or_404(
        Booking.objects.select_related("package", "destination", "hotel", "transport"),
        reference=reference,
        user=request.user,
    )
    return render(request, "bookings/confirmation.html", {"booking": booking})


@login_required
def download_itinerary(request, reference):
    booking = get_object_or_404(
        Booking.objects.select_related("package", "destination", "hotel", "transport"),
        reference=reference,
        user=request.user,
    )
    package = booking.package
    hotel_total = (booking.hotel.price_per_night * booking.nights) if booking.hotel else 0
    transport_total = booking.transport.price if booking.transport else (package.taxi_cost if package else 0)
    flight_total = package.flight_cost if package else 0
    food_total = package.food_cost if package else 0
    activities_total = package.activities_cost if package else 0
    taxi_total = package.taxi_cost if package else 0
    amount_paid = float(booking.total_price)

    invoice_payload = {
        "invoiceNumber": f"INV-{booking.created_at:%Y}-{booking.pk:03d}",
        "bookingReference": booking.reference,
        "bookingStatus": "Booking Confirmed",
        "tripTitle": package.title if package else booking.destination.name,
        "dates": f"{booking.start_date:%B %d, %Y} - {booking.end_date:%B %d, %Y}",
        "company": {
            "name": "Voyageur",
            "email": "support@voyageur.travel",
            "website": request.build_absolute_uri(reverse("dashboard:home")),
        },
        "client": {
            "name": booking.user.get_full_name() or booking.user.username,
            "email": booking.user.email or "not-provided@example.com",
            "phone": getattr(booking.user.profile, "phone", "") or "Not provided",
        },
        "trip": {
            "destination": booking.destination.name,
            "travelers": f"{booking.travelers} Guests",
            "hotel": str(booking.hotel or "To be assigned"),
            "transport": str(booking.transport or "To be assigned"),
        },
        "lineItems": [
            {"label": "Flight", "icon": "✈️", "value": float(flight_total)},
            {"label": "Hotel", "icon": "🏨", "value": float(hotel_total or package.hotel_cost if package else 0)},
            {"label": "Food", "icon": "🍽", "value": float(food_total)},
            {"label": "Activities", "icon": "🎯", "value": float(activities_total)},
            {"label": "Taxi", "icon": "🚕", "value": float(taxi_total or transport_total)},
        ],
        "amountPaid": amount_paid,
        "dashboardUrl": request.build_absolute_uri(reverse("dashboard:user_dashboard")),
    }

    script_path = Path(__file__).resolve().parent.parent / "scripts" / "render_invoice.mjs"
    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            input_path = Path(tmp_dir) / "invoice.json"
            output_path = Path(tmp_dir) / f"{booking.reference.lower()}-invoice.pdf"
            input_path.write_text(json.dumps(invoice_payload), encoding="utf-8")

            completed = subprocess.run(
                ["node", str(script_path), str(input_path), str(output_path)],
                capture_output=True,
                text=True,
                check=False,
                timeout=60,
            )
            if completed.returncode != 0 or not output_path.exists():
                error_message = completed.stderr.strip() or completed.stdout.strip() or "Invoice generation failed."
                return HttpResponse(error_message, status=500)

            pdf_bytes = output_path.read_bytes()
    except subprocess.TimeoutExpired:
        return HttpResponse("Invoice generation timed out.", status=504)

    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{booking.reference.lower()}-invoice.pdf"'
    return response

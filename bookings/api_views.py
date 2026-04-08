import json
import subprocess
import tempfile
from pathlib import Path

from django.http import HttpResponse
from django.urls import reverse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer


class BookingListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.select_related("package__destination", "destination", "hotel__destination", "transport").filter(
            user=self.request.user
        )


class BookingCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class InvoiceAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        booking = Booking.objects.select_related("package", "destination", "hotel", "transport", "user__profile").filter(
            pk=booking_id, user=request.user
        ).first()
        if not booking:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        package = booking.package
        metadata = booking.metadata or {}
        hotel_total = (booking.hotel.price_per_night * booking.nights) if booking.hotel else float(metadata.get("customHotel", {}).get("pricePerNight", 0) or 0) * booking.nights
        transport_total = booking.transport.price if booking.transport else (package.taxi_cost if package else float(metadata.get("customTransport", {}).get("price", 0) or 0))
        flight_total = package.flight_cost if package else float(metadata.get("flightTotal", 0) or 0)
        food_total = package.food_cost if package else float(metadata.get("foodTotal", 0) or 0)
        activities_total = package.activities_cost if package else float(metadata.get("activitiesTotal", 0) or 0)
        taxi_total = package.taxi_cost if package else float(metadata.get("localTransportTotal", transport_total) or 0)
        base_total = package.price if package else float(metadata.get("basePrice", 0) or 0)
        activity_labels = [item.get("name") for item in metadata.get("customActivities", []) if item.get("name")]

        invoice_payload = {
            "invoiceNumber": f"INV-{booking.created_at:%Y}-{booking.pk:03d}",
            "bookingReference": booking.reference,
            "bookingStatus": "Booking Confirmed",
            "tripTitle": package.title if package else booking.destination.name,
            "dates": f"{booking.start_date:%B %d, %Y} - {booking.end_date:%B %d, %Y}",
            "company": {
                "name": "Voyageur",
                "email": "support@voyageur.travel",
                "website": "https://voyageur.example.com",
            },
            "client": {
                "name": booking.user.get_full_name() or booking.user.username,
                "email": booking.user.email or "not-provided@example.com",
                "phone": getattr(booking.user.profile, "phone", "") or "Not provided",
            },
            "trip": {
                "destination": booking.destination.name,
                "travelers": f"{booking.travelers} Guests",
                "hotel": str(booking.hotel or metadata.get("customHotel", {}).get("name") or "To be assigned"),
                "transport": str(
                    booking.transport
                    or metadata.get("customFlight", {}).get("name")
                    or metadata.get("customTransport", {}).get("name")
                    or "To be assigned"
                ),
            },
            "lineItems": [
                {"label": "Base Trip", "icon": "🧭", "value": float(base_total)},
                {"label": "Flight", "icon": "✈️", "value": float(flight_total)},
                {"label": "Hotel", "icon": "🏨", "value": float(hotel_total or (package.hotel_cost if package else 0))},
                {"label": "Food", "icon": "🍽", "value": float(food_total)},
                {"label": "Activities", "icon": "🎯", "value": float(activities_total)},
                {"label": "Taxi", "icon": "🚕", "value": float(taxi_total)},
            ],
            "amountPaid": float(booking.total_price),
            "dashboardUrl": request.build_absolute_uri(reverse("api-bookings")),
            "activitySummary": activity_labels,
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
                    return Response({"detail": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                pdf_bytes = output_path.read_bytes()
        except subprocess.TimeoutExpired:
            return Response({"detail": "Invoice generation timed out."}, status=status.HTTP_504_GATEWAY_TIMEOUT)

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{booking.reference.lower()}-invoice.pdf"'
        return response

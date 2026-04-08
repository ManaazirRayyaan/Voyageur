from rest_framework import serializers

from packages.models import Destination, Hotel, Package, Transport
from packages.serializers import PackageListSerializer, HotelSerializer, TransportSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    package = PackageListSerializer(read_only=True)
    hotel = HotelSerializer(read_only=True)
    transport = TransportSerializer(read_only=True)
    destination = serializers.CharField(source="destination.name", read_only=True)
    startDate = serializers.DateField(source="start_date", read_only=True)
    endDate = serializers.DateField(source="end_date", read_only=True)
    totalPrice = serializers.DecimalField(source="total_price", max_digits=10, decimal_places=2, read_only=True)
    isOngoing = serializers.BooleanField(source="is_ongoing", read_only=True)
    metadata = serializers.JSONField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "reference",
            "status",
            "trip_type",
            "destination",
            "package",
            "hotel",
            "transport",
            "travelers",
            "startDate",
            "endDate",
            "totalPrice",
            "isOngoing",
            "metadata",
            "created_at",
        ]


class BookingCreateSerializer(serializers.Serializer):
    package_id = serializers.IntegerField(required=False)
    destination_id = serializers.IntegerField(required=False)
    hotel_id = serializers.IntegerField(required=False, allow_null=True)
    transport_id = serializers.IntegerField(required=False, allow_null=True)
    travelers = serializers.IntegerField(min_value=1)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    custom_notes = serializers.CharField(required=False, allow_blank=True)
    custom_destination = serializers.JSONField(required=False)
    custom_hotel = serializers.JSONField(required=False)
    custom_flight = serializers.JSONField(required=False)
    custom_transport = serializers.JSONField(required=False)
    custom_local_transport = serializers.JSONField(required=False)
    custom_activities = serializers.ListField(child=serializers.JSONField(), required=False)
    pricing = serializers.JSONField(required=False)

    def validate(self, attrs):
        package_id = attrs.get("package_id")
        destination_id = attrs.get("destination_id")
        custom_destination = attrs.get("custom_destination")
        if not package_id and not destination_id and not custom_destination:
            raise serializers.ValidationError("Provide either a package or a destination.")
        if attrs["end_date"] <= attrs["start_date"]:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        request = self.context["request"]
        if package_id and Booking.objects.filter(user=request.user, package_id=package_id, status=Booking.BOOKED).exists():
            raise serializers.ValidationError({"error": "You have already booked this package."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        package = Package.objects.filter(pk=validated_data.get("package_id")).first()
        custom_destination = validated_data.get("custom_destination") or {}
        if package:
            destination = package.destination
        elif validated_data.get("destination_id"):
            destination = Destination.objects.get(pk=validated_data["destination_id"])
        else:
            destination_name = custom_destination.get("name") or custom_destination.get("formatted_address") or "Custom Destination"
            destination_country = custom_destination.get("country") or custom_destination.get("region") or "Selected via map"
            destination, _ = Destination.objects.get_or_create(
                name=destination_name[:200],
                country=destination_country[:200],
                defaults={
                    "description": custom_destination.get("description") or f"Traveler-selected destination in {destination_country}.",
                    "latitude": custom_destination.get("latitude") or 0,
                    "longitude": custom_destination.get("longitude") or 0,
                },
            )

        hotel = Hotel.objects.filter(pk=validated_data.get("hotel_id")).first()
        if not hotel and validated_data.get("custom_hotel"):
            custom_hotel = validated_data["custom_hotel"]
            hotel, _ = Hotel.objects.get_or_create(
                name=custom_hotel.get("name", "Selected Stay")[:255],
                destination=destination,
                defaults={
                    "price_per_night": custom_hotel.get("pricePerNight") or 0,
                    "rating": custom_hotel.get("rating") or 4.5,
                },
            )

        transport = Transport.objects.filter(pk=validated_data.get("transport_id")).first()
        if not transport and validated_data.get("custom_transport"):
            custom_transport = validated_data["custom_transport"]
            transport, _ = Transport.objects.get_or_create(
                type=custom_transport.get("type") or Transport.CAR,
                price=custom_transport.get("price") or 0,
            )

        pricing = validated_data.get("pricing") or {}
        metadata = {
            "customDestination": custom_destination,
            "customHotel": validated_data.get("custom_hotel") or {},
            "customFlight": validated_data.get("custom_flight") or {},
            "customTransport": validated_data.get("custom_transport") or {},
            "customLocalTransport": validated_data.get("custom_local_transport") or {},
            "customActivities": validated_data.get("custom_activities") or [],
            "basePrice": pricing.get("basePrice") or 0,
            "flightTotal": pricing.get("flightTotal") or 0,
            "activitiesTotal": pricing.get("activitiesTotal") or 0,
            "foodTotal": pricing.get("foodTotal") or 0,
            "localTransportTotal": pricing.get("localTransportTotal") or 0,
        }

        booking = Booking(
            user=request.user,
            package=package,
            destination=destination,
            hotel=hotel,
            transport=transport,
            travelers=validated_data["travelers"],
            start_date=validated_data["start_date"],
            end_date=validated_data["end_date"],
            custom_notes=validated_data.get("custom_notes", ""),
            trip_type=Booking.PACKAGE if package else Booking.CUSTOM,
            status=Booking.BOOKED,
            total_price="0.00",
            metadata=metadata,
        )
        booking.total_price = booking.calculate_total()
        booking.save()
        return booking

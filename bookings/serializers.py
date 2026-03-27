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

    def validate(self, attrs):
        package_id = attrs.get("package_id")
        destination_id = attrs.get("destination_id")
        if not package_id and not destination_id:
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
        destination = package.destination if package else Destination.objects.get(pk=validated_data["destination_id"])
        hotel = Hotel.objects.filter(pk=validated_data.get("hotel_id")).first()
        transport = Transport.objects.filter(pk=validated_data.get("transport_id")).first()

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
        )
        booking.total_price = booking.calculate_total()
        booking.save()
        return booking

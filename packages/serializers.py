from django.template.defaultfilters import slugify
from rest_framework import serializers

from reviews.models import Review

from .models import Hotel, Package, Transport


def package_image_url(package):
    if package.cover_image:
        return package.cover_image.url
    seed = slugify(package.title) or f"package-{package.pk}"
    return f"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig={seed}"


class HotelSerializer(serializers.ModelSerializer):
    pricePerNight = serializers.DecimalField(source="price_per_night", max_digits=10, decimal_places=2, read_only=True)
    destinationSlug = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Hotel
        fields = ["id", "name", "pricePerNight", "rating", "destinationSlug", "summary"]

    def get_destinationSlug(self, obj):
        return slugify(obj.destination.name)

    def get_summary(self, obj):
        return f"{obj.destination.name} stay with {obj.rating}/5 rating."


class TransportSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Transport
        fields = ["id", "type", "price", "description", "icon"]

    def get_description(self, obj):
        return f"{obj.get_type_display()} transfer option for premium trip logistics."

    def get_icon(self, obj):
        return {
            Transport.FLIGHT: "fa-plane",
            Transport.TRAIN: "fa-train",
            Transport.BUS: "fa-bus",
            Transport.CAR: "fa-car-side",
        }.get(obj.type, "fa-route")


class ReviewSnippetSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    destinationSlug = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "name", "title", "rating", "comment", "avatar", "destinationSlug", "createdAt"]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_title(self, obj):
        return f"{obj.destination.name} traveler review"

    def get_avatar(self, obj):
        return f"https://i.pravatar.cc/100?u={obj.user.username}"

    def get_destinationSlug(self, obj):
        return slugify(obj.destination.name)


class PackageListSerializer(serializers.ModelSerializer):
    destinationId = serializers.IntegerField(source="destination.id", read_only=True)
    destination = serializers.CharField(source="destination.name", read_only=True)
    country = serializers.CharField(source="destination.country", read_only=True)
    destinationSlug = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    durationDays = serializers.IntegerField(source="duration_days", read_only=True)
    latitude = serializers.FloatField(source="destination.latitude", read_only=True)
    longitude = serializers.FloatField(source="destination.longitude", read_only=True)
    featured = serializers.BooleanField(source="is_featured", read_only=True)
    popular = serializers.BooleanField(source="is_popular", read_only=True)
    description = serializers.SerializerMethodField()

    class Meta:
        model = Package
        fields = [
            "id",
            "title",
            "slug",
            "destination",
            "destinationId",
            "country",
            "destinationSlug",
            "description",
            "price",
            "durationDays",
            "rating",
            "category",
            "vibe",
            "image",
            "latitude",
            "longitude",
            "featured",
            "popular",
        ]

    def get_destinationSlug(self, obj):
        return slugify(obj.destination.name)

    def get_image(self, obj):
        return package_image_url(obj)

    def get_description(self, obj):
        return obj.description[:140] + ("..." if len(obj.description) > 140 else "")


class PackageDetailSerializer(PackageListSerializer):
    heroImage = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    longDescription = serializers.CharField(source="description", read_only=True)
    latitude = serializers.FloatField(source="destination.latitude", read_only=True)
    longitude = serializers.FloatField(source="destination.longitude", read_only=True)
    includedItems = serializers.ListField(source="included_items", read_only=True)
    excludedItems = serializers.ListField(source="excluded_items", read_only=True)
    hotels = HotelSerializer(many=True, read_only=True)
    transports = TransportSerializer(many=True, read_only=True)
    restaurants = serializers.ListField(read_only=True)
    itinerary = serializers.ListField(read_only=True)
    totalCost = serializers.DecimalField(source="total_cost", max_digits=10, decimal_places=2, read_only=True)
    flightCost = serializers.DecimalField(source="flight_cost", max_digits=10, decimal_places=2, read_only=True)
    hotelCost = serializers.DecimalField(source="hotel_cost", max_digits=10, decimal_places=2, read_only=True)
    foodCost = serializers.DecimalField(source="food_cost", max_digits=10, decimal_places=2, read_only=True)
    activitiesCost = serializers.DecimalField(source="activities_cost", max_digits=10, decimal_places=2, read_only=True)
    taxiCost = serializers.DecimalField(source="taxi_cost", max_digits=10, decimal_places=2, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta(PackageListSerializer.Meta):
        fields = PackageListSerializer.Meta.fields + [
            "heroImage",
            "gallery",
            "longDescription",
            "latitude",
            "longitude",
            "includedItems",
            "excludedItems",
            "hotels",
            "transports",
            "restaurants",
            "itinerary",
            "reviews",
            "totalCost",
            "flightCost",
            "hotelCost",
            "foodCost",
            "activitiesCost",
            "taxiCost",
        ]

    def get_heroImage(self, obj):
        return package_image_url(obj)

    def get_gallery(self, obj):
        hero = package_image_url(obj)
        return [hero, hero, hero, hero]

    def get_reviews(self, obj):
        reviews = obj.destination.reviews.select_related("user").all()[:6]
        return ReviewSnippetSerializer(reviews, many=True).data

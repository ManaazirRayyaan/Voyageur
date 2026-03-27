from django.template.defaultfilters import slugify
from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    destinationSlug = serializers.SerializerMethodField()
    destination = serializers.CharField(source="destination.name", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    destination_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "name",
            "title",
            "avatar",
            "destination",
            "destinationSlug",
            "destination_id",
            "rating",
            "comment",
            "createdAt",
        ]
        read_only_fields = ["id", "name", "title", "avatar", "destination", "destinationSlug", "createdAt"]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_title(self, obj):
        return f"{obj.destination.name} traveler review"

    def get_avatar(self, obj):
        return f"https://i.pravatar.cc/100?u={obj.user.username}"

    def get_destinationSlug(self, obj):
        return slugify(obj.destination.name)

    def create(self, validated_data):
        user = self.context["request"].user
        return Review.objects.create(user=user, **validated_data)

import random

from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from packages.serializers import PackageListSerializer

from .models import Wishlist

User = get_user_model()


def split_name(full_name):
    full_name = (full_name or "").strip()
    if not full_name:
        return "", ""
    parts = full_name.split(maxsplit=1)
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def username_suggestions(username):
    base = "".join(char for char in (username or "voyageur") if char.isalnum() or char == "_").strip("_") or "voyageur"
    suggestions = [
        f"{base}{random.randint(101, 999)}",
        f"{base}_{random.randint(1, 99):02d}",
        f"{base}{random.randint(1000, 9999)}",
    ]
    return [item for item in suggestions if not User.objects.filter(username__iexact=item).exists()]


class UserSummarySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    age = serializers.IntegerField(source="profile.age", read_only=True)
    gender = serializers.CharField(source="profile.gender", read_only=True)
    phone = serializers.CharField(source="profile.phone", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "username", "email", "age", "gender", "phone"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    suggestions = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = User
        fields = ["name", "username", "email", "password", "suggestions"]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                {
                    "message": "This username is already taken.",
                    "suggestions": username_suggestions(value),
                }
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        password = validated_data.pop("password")
        first_name, last_name = split_name(name)
        user = User(**validated_data, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"})

    def validate(self, attrs):
        identifier = attrs.get("identifier")
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), username=identifier, password=password)
        if not user:
            raise serializers.ValidationError({"detail": "Invalid username/email or password."})
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    age = serializers.IntegerField(source="profile.age", read_only=True)
    gender = serializers.CharField(source="profile.gender", read_only=True)
    phone = serializers.CharField(source="profile.phone", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "username", "email", "age", "gender", "phone"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class ProfileUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    age = serializers.IntegerField(source="profile.age", required=False, allow_null=True)
    gender = serializers.CharField(source="profile.gender", required=False, allow_blank=True)
    phone = serializers.CharField(source="profile.phone", required=False, allow_blank=True)
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={"input_type": "password"})
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["name", "username", "email", "age", "gender", "phone", "current_password", "new_password"]

    def validate_username(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                {
                    "message": "This username is already taken.",
                    "suggestions": username_suggestions(value),
                }
            )
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        current_password = attrs.pop("current_password", "")
        new_password = attrs.pop("new_password", "")
        if new_password:
            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
            try:
                validate_password(new_password, user=self.instance)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"new_password": list(exc.messages)})
            attrs["password_to_set"] = new_password
        return attrs

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        password_to_set = validated_data.pop("password_to_set", None)
        name = validated_data.pop("name", "")
        first_name, last_name = split_name(name)

        instance.first_name = first_name
        instance.last_name = last_name
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        if password_to_set:
            instance.set_password(password_to_set)
        instance.save()

        profile = instance.profile
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.save()
        return instance


class WishlistSerializer(serializers.ModelSerializer):
    package = PackageListSerializer(read_only=True)
    package_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Wishlist
        fields = ["id", "package", "package_id", "created_at"]
        read_only_fields = ["id", "created_at", "package"]


def build_auth_payload(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSummarySerializer(user).data,
    }

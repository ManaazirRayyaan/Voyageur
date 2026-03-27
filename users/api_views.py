from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from packages.models import Package

from .models import Wishlist
from .serializers import (
    LoginSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    WishlistSerializer,
    build_auth_payload,
    username_suggestions,
)

User = get_user_model()


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(build_auth_payload(user), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(build_auth_payload(serializer.validated_data["user"]))


class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)


class ProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)


class ProfileUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProfileSerializer(request.user).data)


class UsernameSuggestionAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        username = request.query_params.get("username", "")
        exists = User.objects.filter(username__iexact=username).exists()
        return Response({"available": not exists, "suggestions": [] if not exists else username_suggestions(username)})


class WishlistListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.select_related("package__destination").filter(user=request.user)
        return Response(WishlistSerializer(items, many=True).data)


class WishlistAddAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        package = Package.objects.filter(pk=request.data.get("package_id")).first()
        if not package:
            return Response({"detail": "Package not found."}, status=status.HTTP_404_NOT_FOUND)
        item, _ = Wishlist.objects.get_or_create(user=request.user, package=package)
        return Response(WishlistSerializer(item).data, status=status.HTTP_201_CREATED)


class WishlistRemoveAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        package_id = request.data.get("package_id") or request.query_params.get("package_id")
        deleted, _ = Wishlist.objects.filter(user=request.user, package_id=package_id).delete()
        if not deleted:
            return Response({"detail": "Wishlist item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

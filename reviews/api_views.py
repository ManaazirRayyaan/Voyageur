from rest_framework import generics, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Review.objects.select_related("user", "destination")
        destination_id = self.request.query_params.get("destination_id")
        if destination_id:
            queryset = queryset.filter(destination_id=destination_id)
        return queryset

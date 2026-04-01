from django.db.models import Q
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

from .models import Package
from .serializers import PackageDetailSerializer, PackageListSerializer


class PackagePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 30


class PackageListAPIView(generics.ListAPIView):
    serializer_class = PackageListSerializer
    pagination_class = PackagePagination

    def get_queryset(self):
        queryset = Package.objects.select_related("destination").only(
            "id",
            "title",
            "slug",
            "description",
            "price",
            "duration_days",
            "rating",
            "category",
            "vibe",
            "cover_image",
            "is_featured",
            "is_popular",
            "destination__id",
            "destination__name",
            "destination__country",
            "destination__latitude",
            "destination__longitude",
        )
        query = self.request.query_params.get("query", "").strip()
        destination = self.request.query_params.get("destination", "").strip()
        category = self.request.query_params.get("category", "").strip()
        vibe = self.request.query_params.get("vibe", "").strip()
        max_price = self.request.query_params.get("max_price", "").strip()
        min_rating = self.request.query_params.get("rating", "").strip()
        duration = self.request.query_params.get("duration", "").strip()

        if query:
            queryset = queryset.filter(title__icontains=query)
        if destination:
            queryset = queryset.filter(
                Q(destination__name__icontains=destination)
                | Q(destination__country__icontains=destination)
                | Q(to_location__icontains=destination)
            )
        if category:
            queryset = queryset.filter(category__iexact=category)
        if vibe:
            queryset = queryset.filter(vibe__icontains=vibe)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        if duration == "short":
            queryset = queryset.filter(duration_days__lte=4)
        elif duration == "medium":
            queryset = queryset.filter(duration_days__gte=5, duration_days__lte=8)
        elif duration == "long":
            queryset = queryset.filter(duration_days__gte=9)
        return queryset


class PackageDetailAPIView(generics.RetrieveAPIView):
    queryset = Package.objects.select_related("destination").prefetch_related(
        "hotels", "transports", "destination__reviews__user"
    )
    serializer_class = PackageDetailSerializer

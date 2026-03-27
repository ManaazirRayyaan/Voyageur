from django.core.paginator import Paginator
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404, render

from reviews.forms import ReviewForm
from reviews.models import Review

from .forms import PackageFilterForm
from .models import Destination, Package


def package_list(request):
    form = PackageFilterForm(request.GET or None)
    queryset = Package.objects.select_related("destination").prefetch_related("hotels", "transports")

    if form.is_valid():
        query = form.cleaned_data.get("q")
        destination = form.cleaned_data.get("destination")
        min_price = form.cleaned_data.get("min_price")
        max_price = form.cleaned_data.get("max_price")
        duration = form.cleaned_data.get("duration")
        rating = form.cleaned_data.get("rating")
        category = form.cleaned_data.get("category")
        vibe = form.cleaned_data.get("vibe")

        if query:
            queryset = queryset.filter(title__icontains=query)
        if destination:
            queryset = queryset.filter(
                Q(destination__name__icontains=destination)
                | Q(destination__country__icontains=destination)
                | Q(to_location__icontains=destination)
            )
        if min_price is not None:
            queryset = queryset.filter(total_cost__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(total_cost__lte=max_price)
        if duration == "short":
            queryset = queryset.filter(duration_days__lte=4)
        elif duration == "medium":
            queryset = queryset.filter(duration_days__gte=5, duration_days__lte=8)
        elif duration == "long":
            queryset = queryset.filter(duration_days__gte=9)
        if rating is not None:
            queryset = queryset.filter(rating__gte=rating)
        if category:
            queryset = queryset.filter(category=category)
        if vibe:
            queryset = queryset.filter(vibe__iexact=vibe)

    paginator = Paginator(queryset, 6)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "packages": page_obj.object_list,
        "page_obj": page_obj,
        "filter_form": form,
        "destinations": Destination.objects.all()[:6],
        "wishlist_package_ids": set(
            request.user.wishlist_items.values_list("package_id", flat=True)
        ) if request.user.is_authenticated else set(),
    }
    return render(request, "packages/list.html", context)


def package_detail(request, slug):
    package = get_object_or_404(
        Package.objects.select_related("destination").prefetch_related("hotels", "transports"),
        slug=slug,
    )
    destination_reviews = Review.objects.filter(destination=package.destination).select_related("user")
    average_rating = destination_reviews.aggregate(avg=Avg("rating"))["avg"] or package.rating
    context = {
        "package": package,
        "hotels": package.hotels.all() or package.destination.hotels.all(),
        "transports": package.transports.all(),
        "reviews": destination_reviews[:6],
        "average_rating": round(average_rating, 1),
        "review_form": ReviewForm(),
        "is_in_wishlist": request.user.is_authenticated and request.user.wishlist_items.filter(package=package).exists(),
    }
    return render(request, "packages/detail.html", context)

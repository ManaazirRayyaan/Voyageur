from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from django.shortcuts import get_object_or_404, redirect, render

from packages.models import Destination

from .forms import ReviewForm
from .models import Review


def review_list(request):
    reviews = Review.objects.select_related("user", "destination")
    rating_filter = request.GET.get("rating")
    if rating_filter:
        reviews = reviews.filter(rating__gte=rating_filter)

    stats = reviews.aggregate(avg_rating=Avg("rating"))
    context = {
        "reviews": reviews[:12],
        "average_rating": round(stats["avg_rating"] or 0, 1),
        "review_form": ReviewForm(),
        "destinations": Destination.objects.all()[:6],
    }
    return render(request, "reviews/list.html", context)


@login_required
def create_review(request, destination_id=None):
    destination = get_object_or_404(Destination, pk=destination_id) if destination_id else None
    form = ReviewForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        review = form.save(commit=False)
        review.user = request.user
        review.destination = destination or form.cleaned_data["destination"]
        review.save()
        messages.success(request, "Review submitted.")
    else:
        messages.error(request, "Please provide a valid rating between 1 and 5.")
    return redirect(request.POST.get("next") or "reviews:list")

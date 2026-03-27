from django.urls import path

from .views import create_review, review_list

app_name = "reviews"

urlpatterns = [
    path("", review_list, name="list"),
    path("create/", create_review, name="create_generic"),
    path("destination/<int:destination_id>/create/", create_review, name="create"),
]

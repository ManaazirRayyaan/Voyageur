from django.urls import path

from .views import package_detail, package_list

app_name = "packages"

urlpatterns = [
    path("", package_list, name="list"),
    path("<slug:slug>/", package_detail, name="detail"),
]

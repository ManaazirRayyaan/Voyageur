from django.urls import path

from .views import home, user_dashboard

app_name = "dashboard"

urlpatterns = [
    path("", home, name="home"),
    path("dashboard/", user_dashboard, name="user_dashboard"),
]

# trips/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_trips),
    path('create/', views.create_trip),
]
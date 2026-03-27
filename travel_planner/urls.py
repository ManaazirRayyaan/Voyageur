from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from .views import serve_react_app

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("travel_planner.api_urls")),
    re_path(r"^assets/(?P<path>.*)$", serve, {"document_root": settings.BASE_DIR / "dist" / "assets"}),
    re_path(r"^(?!api/|admin/|media/|assets/).*$", serve_react_app),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

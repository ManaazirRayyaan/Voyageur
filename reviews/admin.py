from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "destination", "rating", "created_at")
    list_filter = ("rating", "destination")
    search_fields = ("user__username", "destination__name", "comment")

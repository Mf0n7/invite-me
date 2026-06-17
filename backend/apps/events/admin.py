from django.contrib import admin

from .models import Event, EventLink


@admin.register(EventLink)
class EventLinkAdmin(admin.ModelAdmin):
    list_display = ["event", "token", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["event__title", "token"]
    readonly_fields = ["token", "created_at"]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "owner", "starts_at", "allow_companions", "created_at"]
    list_filter = ["allow_companions", "starts_at"]
    search_fields = ["title", "address", "owner__email"]
    readonly_fields = ["uuid", "created_at", "updated_at"]
    date_hierarchy = "starts_at"

from django.contrib import admin

from .models import GiftItem


@admin.register(GiftItem)
class GiftItemAdmin(admin.ModelAdmin):
    list_display = ["title", "event", "status", "claimed_by_name", "claimed_at"]
    list_filter = ["status", "event"]
    search_fields = ["title", "event__title", "claimed_by_name"]
    readonly_fields = ["claimed_at", "created_at"]

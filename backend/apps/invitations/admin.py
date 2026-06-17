from django.contrib import admin

from .models import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ["guest_name", "event", "status", "confirmed_at", "created_at"]
    list_filter = ["status", "event"]
    search_fields = ["guest_name", "event__title"]
    readonly_fields = ["token", "confirmed_at", "created_at"]

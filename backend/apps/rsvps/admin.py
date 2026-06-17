from django.contrib import admin

from .models import Rsvp


@admin.register(Rsvp)
class RsvpAdmin(admin.ModelAdmin):
    list_display = ["name", "event", "companions_count", "created_at"]
    list_filter = ["event"]
    search_fields = ["name", "event__title"]
    readonly_fields = ["created_at"]

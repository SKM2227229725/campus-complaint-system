from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
admin.site.register(User, UserAdmin)
for m in (Department, Location, Category): admin.site.register(m)

class GrantAdmin(admin.ModelAdmin):
    list_display = ("complaint", "user", "active", "expires_at")
    def save_model(self, request, obj, form, change):
        obj.granted_by = request.user; super().save_model(request, obj, form, change)
        AuditLog.objects.create(action="grant_saved", user=request.user, complaint_id=obj.complaint_id, ip=request.META.get("REMOTE_ADDR"))
admin.site.register(ConfidentialAccessGrant, GrantAdmin)
class AuditAdmin(admin.ModelAdmin):
    list_display = ("at", "action", "user", "complaint_id", "ip")
    def has_add_permission(self, r): return False
    def has_change_permission(self, r, o=None): return False
    def has_delete_permission(self, r, o=None): return False
admin.site.register(AuditLog, AuditAdmin)
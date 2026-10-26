import hashlib
from django.contrib.auth.models import AbstractUser
from django.db import models

ROLES = [("student","Student"),("officer","Department Officer"),("hod","HOD"),("warden","Hostel Warden"),
    ("chief_warden","Chief Warden"),("dean","Dean of Student Welfare"),("director","Director"),("sysadmin","System Administrator")]
STAFF_ROLES = {r for r,_ in ROLES} - {"student"}
SENIOR_ROLES = {"dean","director","sysadmin"}

class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL)
    def __str__(self): return self.name

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLES, default="student")
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name="staff")

class Location(models.Model):
    name = models.CharField(max_length=120)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)
    def __str__(self): return self.name

class Category(models.Model):
    name = models.CharField(max_length=120)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="children")
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    is_confidential = models.BooleanField(default=False)
    form_schema = models.JSONField(default=dict, blank=True)
    def resolve_department(self):
        c = self
        while c:
            if c.department_id: return c.department
            c = c.parent
        return None
    def __str__(self): return self.name

class Status(models.TextChoices):
    SUBMITTED="submitted"; AWAITING_REVIEW="awaiting_review"; ASSIGNED="assigned"; IN_PROGRESS="in_progress"
    AWAITING_INFO="awaiting_info"; RESOLVED="resolved"; CLOSED="closed"; REOPENED="reopened"; REJECTED="rejected"

TRANSITIONS = {
    "submitted":["awaiting_review","assigned","rejected"], "awaiting_review":["assigned","rejected"],
    "assigned":["in_progress","awaiting_info","resolved","rejected"], "in_progress":["awaiting_info","resolved"],
    "awaiting_info":["in_progress"], "resolved":["closed","reopened"], "closed":["reopened"],
    "reopened":["assigned","in_progress"], "rejected":[],
}

def hash_token(t): return hashlib.sha256(t.encode()).hexdigest()

class Complaint(models.Model):
    reference_no = models.CharField(max_length=20, unique=True, editable=False)
    reporter = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="complaints")
    is_anonymous = models.BooleanField(default=False)
    tracking_token_hash = models.CharField(max_length=64, blank=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=200)
    description = models.TextField()
    original_language = models.CharField(max_length=10, default="en")
    incident_at = models.DateTimeField(null=True, blank=True)
    affected_count = models.PositiveIntegerField(null=True, blank=True)
    extra_data = models.JSONField(default=dict, blank=True)
    is_confidential = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED, db_index=True)
    assigned_department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    assigned_officer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned")
    resolution_notes = models.TextField(blank=True)
    
    # NAYE FIELDS
    severity = models.CharField(max_length=10, choices=[('LOW','Low'), ('MEDIUM','Medium'), ('HIGH','High'), ('CRITICAL','Critical')], default='LOW')
    duplicate_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='duplicates')
    attachment = models.ImageField(upload_to='complaints/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: ordering = ["-created_at"]; indexes = [models.Index(fields=["status","assigned_department"])]

class StatusHistory(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="history")
    from_status = models.CharField(max_length=20); to_status = models.CharField(max_length=20)
    actor = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    note = models.TextField(blank=True)
    at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    body = models.TextField()
    internal = models.BooleanField(default=False)
    at = models.DateTimeField(auto_now_add=True)

class ConfidentialAccessGrant(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="grants")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="confidential_grants")
    granted_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    reason = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = [("complaint", "user")]

class AuditLog(models.Model):
    action = models.CharField(max_length=40, db_index=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    complaint_id = models.PositiveIntegerField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    at = models.DateTimeField(auto_now_add=True)
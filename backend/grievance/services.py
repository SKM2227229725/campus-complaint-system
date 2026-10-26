import secrets
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.core.mail import send_mail
from .models import *

def visible_complaints(user):
    q = Complaint.objects.all()
    if user.role == "student": return q.filter(reporter=user)
    open_ = q.filter(is_confidential=False)
    if user.role in SENIOR_ROLES: base = open_
    elif user.department_id: base = open_.filter(Q(assigned_officer=user)|Q(assigned_department_id=user.department_id))
    else: base = open_.filter(assigned_officer=user)
    now = timezone.now()
    grants = ConfidentialAccessGrant.objects.filter(user=user, active=True).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=now)).values("complaint_id")
    conf = q.filter(is_confidential=True).filter(Q(assigned_officer=user) | Q(id__in=grants))
    return (base | conf).distinct()

def change_status(c, to, actor, note=""):
    if to not in TRANSITIONS.get(c.status, []): raise ValueError(f"Cannot move from {c.status} to {to}")
    if to == "reopened" and actor and actor.role == "student":
        last = c.history.filter(to_status__in=["resolved", "closed"]).order_by("-at").first()
        if not last or timezone.now() - last.at > timedelta(days=settings.REOPEN_WINDOW_DAYS):
            raise ValueError(f"Reopen window of {settings.REOPEN_WINDOW_DAYS} days has expired")
    if to == "rejected" and not note.strip(): raise ValueError("A reason is required to reject a complaint")
    StatusHistory.objects.create(complaint=c, from_status=c.status, to_status=to, actor=actor, note=note)
    c.status = to; c.save(update_fields=["status","updated_at"])

def route(c):
    dept = c.category.resolve_department()
    if not dept: return change_status(c, "awaiting_review", None, "No confident department; sent to review queue")
    officer = dept.staff.filter(role="officer").order_by("id").first()
    c.assigned_department, c.assigned_officer = dept, officer; c.save()
    change_status(c, "assigned", None, f"Auto-routed to {dept.name}")

# --- NAYA LOGIC ---

def analyze_and_route(c):
    """AI logic: Severity check aur Duplicate detection"""
    text = f"{c.title} {c.description}".lower()
    
    # 1. Severity Check
    critical = ["fire", "shock", "danger", "emergency", "blood", "injury", "collapse"]
    high = ["water", "paani", "current", "security", "threat", "harassment", "ragging"]
    
    if any(w in text for w in critical):
        c.severity = "CRITICAL"
    elif any(w in text for w in high):
        c.severity = "HIGH"
    elif "not working" in text or "issue" in text:
        c.severity = "MEDIUM"
    else:
        c.severity = "LOW"

    # 2. Duplicate Check (Last 24 hours)
    last_24h = timezone.now() - timedelta(hours=24)
    recent = Complaint.objects.filter(created_at__gte=last_24h, category=c.category).exclude(id=c.id)
    for rc in recent:
        common = set(text.split()) & set(f"{rc.title} {rc.description}".lower().split())
        if len(common) >= 3:
            c.duplicate_of = rc
            break
            
    c.save()

def send_email_alert(c):
    """Email Routing based on Category"""
    cat = c.category.name.lower()
    email = "admin@recsonbhadra.ac.in"
    if "hostel" in cat: email = "akashupsdm1@gmail.com"
    elif "canteen" in cat or "ground" in cat: email = "vishalgit38@gmail.com"
    elif "academic" in cat or "lab" in cat: email = "shailesh91199477@gmail.com"

    subject = f"[{c.severity}] New Complaint: {c.reference_no}"
    msg = f"Title: {c.title}\n\nDescription: {c.description}\n\nCategory: {c.category.name}\nSeverity: {c.severity}"
    send_mail(subject, msg, 'noreply@recsonbhadra.ac.in', [email], fail_silently=True)

@transaction.atomic
def submit(data, reporter=None, anonymous=False):
    cat = data["category"]; token = ""
    c = Complaint(**data, is_anonymous=anonymous, is_confidential=cat.is_confidential,
                  reporter=None if anonymous else reporter)
    
    if anonymous:
        token = secrets.token_urlsafe(24); c.tracking_token_hash = hash_token(token)
    
    c.reference_no = "TMP"; c.save()
    c.reference_no = f"CMP-{c.pk:06d}"; c.save(update_fields=["reference_no"])
    
    route(c)           # Assign to department
    analyze_and_route(c) # Check severity & duplicate
    send_email_alert(c)  # Send Email
    
    return c, token
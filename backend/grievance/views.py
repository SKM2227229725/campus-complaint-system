from rest_framework import viewsets, mixins, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from . import services

def audit(r, action, cid):
    AuditLog.objects.create(action=action, user=r.user if r.user.is_authenticated else None,
                            complaint_id=cid, ip=r.META.get("REMOTE_ADDR"))

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]; authentication_classes = []
    throttle_classes = [ScopedRateThrottle]; throttle_scope = "register"
    def post(self, r):
        s = RegisterSerializer(data=r.data); s.is_valid(raise_exception=True); u = s.save()
        return Response(UserSerializer(u).data, status=201)

class MeView(APIView):
    def get(self, r): return Response(UserSerializer(r.user).data)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]; queryset = Category.objects.all(); serializer_class = CategorySerializer
    pagination_class = None

class ComplaintViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = ComplaintSerializer
    def get_queryset(self):
        qs = services.visible_complaints(self.request.user)
        s = self.request.query_params.get("status")
        return qs.filter(status=s) if s else qs
    def retrieve(self, r, *a, **k):
        resp = super().retrieve(r, *a, **k)
        if resp.data.get("is_confidential"): audit(r, "confidential_read", resp.data["id"])
        return resp
    def list(self, r, *a, **k):
        resp = super().list(r, *a, **k)
        for item in resp.data.get("results", []):
            if item["is_confidential"]: audit(r, "confidential_read", item["id"])
        return resp
    def create(self, r):
        s = ComplaintInputSerializer(data=r.data); s.is_valid(raise_exception=True)
        c, _ = services.submit(dict(s.validated_data), reporter=r.user)
        return Response(ComplaintSerializer(c).data, status=201)
    @action(detail=True, methods=["post"])
    def status(self, r, pk=None):
        c = self.get_object(); to = r.data.get("status", ""); note = r.data.get("note", "")
        if r.user.role == "student":
            if not (c.reporter_id == r.user.id and to == "reopened"): return Response({"detail": "Not allowed"}, status=403)
        elif r.user.role not in STAFF_ROLES: return Response({"detail": "Not allowed"}, status=403)
        try: services.change_status(c, to, r.user, note)
        except ValueError as e: return Response({"detail": str(e)}, status=400)
        return Response(ComplaintSerializer(c).data)
    @action(detail=True, methods=["post"])
    def assign(self, r, pk=None):
        c = self.get_object()
        if r.user.role not in {"hod","dean","director","chief_warden","officer"}: return Response({"detail": "Not allowed"}, status=403)
        officer = get_object_or_404(User, pk=r.data.get("officer"), role__in=STAFF_ROLES)
        if r.user.role in {"officer", "hod"} and (not r.user.department_id or officer.department_id != r.user.department_id):
            return Response({"detail": "You can only assign within your own department"}, status=403)
        c.assigned_officer, c.assigned_department = officer, officer.department; c.save()
        if c.status in ("submitted","awaiting_review"): services.change_status(c, "assigned", r.user, "Manually assigned")
        return Response(ComplaintSerializer(c).data)
    @action(detail=True, methods=["post"])
    def comments(self, r, pk=None):
        c = self.get_object()
        if not r.data.get("body"): return Response({"detail": "body required"}, status=400)
        Comment.objects.create(complaint=c, author=r.user, body=r.data["body"], internal=r.user.role != "student" and bool(r.data.get("internal")))
        return Response(status=201)

class PublicSubmitView(APIView):
    permission_classes = [permissions.AllowAny]; authentication_classes = []
    throttle_classes = [ScopedRateThrottle]; throttle_scope = "public_submit"
    def post(self, r):
        s = ComplaintInputSerializer(data=r.data); s.is_valid(raise_exception=True)
        if s.validated_data["category"].is_confidential:
            return Response({"detail": "Confidential complaints require identified submission"}, status=400)
        c, token = services.submit(dict(s.validated_data), anonymous=True)
        return Response({"reference_no": c.reference_no, "tracking_token": token,
            "notice": "Save this token now; it cannot be shown again."}, status=201)

class PublicTrackView(APIView):
    permission_classes = [permissions.AllowAny]; authentication_classes = []
    throttle_classes = [ScopedRateThrottle]; throttle_scope = "track"
    def post(self, r):
        t = r.data.get("tracking_token", "")
        c = Complaint.objects.filter(tracking_token_hash=hash_token(t)).first() if t else None
        if not c: return Response({"detail": "Not found"}, status=404)
        return Response({"reference_no": c.reference_no, "status": c.status,
            "history": [{"to": h.to_status, "at": h.at} for h in c.history.all()]})
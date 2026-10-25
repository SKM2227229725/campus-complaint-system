import os, importlib
from datetime import timedelta
from unittest import mock
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import *

class Tests(APITestCase):
    def setUp(self):
        self.cse = Department.objects.create(name="CSE"); self.wel = Department.objects.create(name="Welfare")
        self.lab = Category.objects.create(name="Lab", department=self.cse, form_schema={"fields":[{"name":"lab","required":True}]})
        self.misc = Category.objects.create(name="Other")
        self.conf = Category.objects.create(name="Ragging", department=self.wel, is_confidential=True)
        mk = lambda n, **k: User.objects.create_user(n, password="x"*10, **k)
        self.s1, self.s2 = mk("s1"), mk("s2")
        self.off = mk("off", role="officer", department=self.cse); self.hod = mk("hod", role="hod", department=self.cse)
        self.dean = mk("dean", role="dean", department=self.wel); self.admin = mk("adm", role="sysadmin")
        cache.clear()
    def post(self, user, cat, **kw):
        self.client.force_authenticate(user)
        return self.client.post("/api/v1/complaints/", {"category": cat.pk, "title": "t", "description": "d", **kw}, format="json")
    def test_routing_and_dynamic_validation(self):
        self.assertEqual(self.post(self.s1, self.lab).status_code, 400)
        r = self.post(self.s1, self.lab, extra_data={"lab": "L1"})
        self.assertEqual(r.status_code, 201); self.assertEqual(r.data["status"], "assigned")
        self.assertEqual(Complaint.objects.get().assigned_officer, self.off)
    def test_fallback_review_queue(self):
        self.assertEqual(self.post(self.s1, self.misc).data["status"], "awaiting_review")
    def test_idor_blocked(self):
        cid = self.post(self.s1, self.lab, extra_data={"lab": "L1"}).data["id"]
        self.client.force_authenticate(self.s2)
        self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 404)
    def test_confidential_not_visible_to_admins(self):
        cid = self.post(self.s1, self.conf).data["id"]
        for u in (self.admin, self.dean, self.hod):
            self.client.force_authenticate(u)
            self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 404, u.role)
        self.client.force_authenticate(self.s1)
        self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 200)
    def test_anonymous_flow(self):
        self.client.force_authenticate(None)
        r = self.client.post("/api/v1/public/complaints", {"category": self.lab.pk, "title": "t", "description": "d", "extra_data": {"lab": "L"}}, format="json")
        self.assertEqual(r.status_code, 201); tok = r.data["tracking_token"]
        c = Complaint.objects.get(); self.assertIsNone(c.reporter); self.assertNotEqual(tok, c.tracking_token_hash)
        self.assertEqual(self.client.post("/api/v1/public/track", {"tracking_token": tok}, format="json").data["status"], "assigned")
        self.assertEqual(self.client.post("/api/v1/public/track", {"tracking_token": "bad"}, format="json").status_code, 404)
    def test_status_rules(self):
        cid = self.post(self.s1, self.lab, extra_data={"lab": "L1"}).data["id"]
        url = f"/api/v1/complaints/{cid}/status/"
        self.client.force_authenticate(self.off)
        self.assertEqual(self.client.post(url, {"status": "closed"}).status_code, 400)
        self.assertEqual(self.client.post(url, {"status": "rejected"}).status_code, 400)
        self.assertEqual(self.client.post(url, {"status": "in_progress"}).status_code, 200)
        self.assertEqual(self.client.post(url, {"status": "resolved"}).status_code, 200)
        self.client.force_authenticate(self.s2); self.assertEqual(self.client.post(url, {"status": "reopened"}).status_code, 404)
        self.client.force_authenticate(self.s1); self.assertEqual(self.client.post(url, {"status": "reopened"}).status_code, 200)
        self.assertEqual(Complaint.objects.get().history.count(), 4)
    def test_register_cannot_choose_role(self):
        self.client.force_authenticate(None)
        self.client.post("/api/v1/auth/register", {"username": "n", "password": "longpass123", "role": "sysadmin"})
        self.assertEqual(User.objects.get(username="n").role, "student")
    def test_grant_gives_access_and_audit_row(self):
        cid = self.post(self.s1, self.conf).data["id"]
        self.client.force_authenticate(self.dean)
        self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 404)
        g = ConfidentialAccessGrant.objects.create(complaint_id=cid, user=self.dean, granted_by=self.admin)
        self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 200)
        a = AuditLog.objects.get(action="confidential_read", user=self.dean)
        self.assertEqual(a.complaint_id, cid)
        g.active = False; g.save()
        self.assertEqual(self.client.get(f"/api/v1/complaints/{cid}/").status_code, 404)
    def test_assign_scope(self):
        other = Department.objects.create(name="ECE")
        off2 = User.objects.create_user("off2", password="x"*10, role="officer", department=other)
        cid = self.post(self.s1, self.lab, extra_data={"lab": "L1"}).data["id"]
        url = f"/api/v1/complaints/{cid}/assign/"
        for u in (self.off, self.hod):
            self.client.force_authenticate(u)
            self.assertEqual(self.client.post(url, {"officer": off2.pk}).status_code, 403, u.role)
            self.assertEqual(self.client.post(url, {"officer": self.off.pk}).status_code, 200)
        self.client.force_authenticate(self.dean)
        self.assertEqual(self.client.post(url, {"officer": off2.pk}).status_code, 200)
    def test_anonymous_confidential_rejected(self):
        self.client.force_authenticate(None)
        r = self.client.post("/api/v1/public/complaints", {"category": self.conf.pk, "title": "t", "description": "d"}, format="json")
        self.assertEqual(r.status_code, 400); self.assertEqual(Complaint.objects.count(), 0)
    def test_track_throttle(self):
        codes = [self.client.post("/api/v1/public/track", {"tracking_token": "x"}, format="json").status_code for _ in range(11)]
        self.assertEqual(codes[:10], [404]*10); self.assertEqual(codes[10], 429)
    def test_reopen_window(self):
        cid = self.post(self.s1, self.lab, extra_data={"lab": "L1"}).data["id"]
        url = f"/api/v1/complaints/{cid}/status/"
        self.client.force_authenticate(self.off)
        self.client.post(url, {"status": "in_progress"}); self.client.post(url, {"status": "resolved"})
        StatusHistory.objects.filter(complaint_id=cid, to_status="resolved").update(at=timezone.now() - timedelta(days=8))
        self.client.force_authenticate(self.s1)
        r = self.client.post(url, {"status": "reopened"})
        self.assertEqual(r.status_code, 400); self.assertIn("expired", r.data["detail"])
    def test_postgres_env_is_read(self):
        import config.settings as s
        env = {"POSTGRES_DB": "db1", "POSTGRES_USER": "u1", "POSTGRES_PASSWORD": "p1", "POSTGRES_HOST": "h1"}
        try:
            with mock.patch.dict(os.environ, env):
                d = importlib.reload(s).DATABASES["default"]
            self.assertEqual((d["ENGINE"], d["NAME"], d["USER"], d["HOST"]), ("django.db.backends.postgresql", "db1", "u1", "h1"))
        finally:
            importlib.reload(s)
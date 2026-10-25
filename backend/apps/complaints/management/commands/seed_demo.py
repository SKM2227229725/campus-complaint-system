from django.core.management.base import BaseCommand
from apps.complaints.models import User, Department, Category, Location

class Command(BaseCommand):
    help = "Seed demo data (local development only)"

    def handle(self, *args, **kwargs):
        cse, _ = Department.objects.get_or_create(name="CSE")
        wel, _ = Department.objects.get_or_create(name="Welfare")
        Category.objects.get_or_create(name="Lab", department=cse, defaults={"form_schema": {"fields":[{"name":"lab","required":True}]}})
        Category.objects.get_or_create(name="Other")
        Category.objects.get_or_create(name="Ragging", department=wel, is_confidential=True)
        Location.objects.get_or_create(name="Main Building")
        Location.objects.get_or_create(name="Hostel Block B")

        users = [
            ("s1", "student", None), ("s2", "student", None),
            ("off", "officer", cse), ("hod", "hod", cse),
            ("dean", "dean", wel), ("adm", "sysadmin", None),
        ]
        for username, role, dept in users:
            u, created = User.objects.get_or_create(username=username, defaults={"role": role, "department": dept})
            if created:
                u.set_password("demo-pass-123")
                u.save()
        self.stdout.write(self.style.SUCCESS("Seed complete. Demo password: demo-pass-123"))
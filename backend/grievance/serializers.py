from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta: model = User; fields = ["id","username","email","role","department"]

class RegisterSerializer(serializers.ModelSerializer):
    class Meta: model = User; fields = ["username","email","password"]; extra_kwargs = {"password":{"write_only":True,"min_length":8}}
    def create(self, v):
        return User.objects.create_user(role="student", **v)

class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = ["id","name","parent","is_confidential","form_schema"]

class ComplaintInputSerializer(serializers.ModelSerializer):
    class Meta: model = Complaint; fields = ["category","location","title","description","original_language","incident_at","affected_count","extra_data"]
    def validate(self, a):
        extra = a.get("extra_data") or {}
        for f in a["category"].form_schema.get("fields", []):
            if f.get("required") and not str(extra.get(f["name"], "")).strip():
                raise serializers.ValidationError({"extra_data": f"'{f.get('label', f['name'])}' is required for this category"})
        return a

class HistorySerializer(serializers.ModelSerializer):
    class Meta: model = StatusHistory; fields = ["from_status","to_status","note","at"]

class ComplaintSerializer(serializers.ModelSerializer):
    history = HistorySerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    assigned_officer_username = serializers.CharField(source="assigned_officer.username", read_only=True, allow_null=True)
    class Meta:
        model = Complaint
        fields = ["id","reference_no","is_anonymous","category","category_name","location","title","description","original_language",
                  "incident_at","affected_count","extra_data","is_confidential","status","assigned_department",
                  "assigned_officer","assigned_officer_username","resolution_notes","created_at","history"]

class TrackRequestSerializer(serializers.Serializer):
    tracking_token = serializers.CharField()
class StatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)
class AssignRequestSerializer(serializers.Serializer):
    officer = serializers.IntegerField()
class CommentRequestSerializer(serializers.Serializer):
    body = serializers.CharField()
    internal = serializers.BooleanField(required=False)
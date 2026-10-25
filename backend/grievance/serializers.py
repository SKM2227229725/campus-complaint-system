from rest_framework import serializers
from .models import User, Department, Location, Category, Complaint


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "role", "department"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ["username", "password"]
    def create(self, data):
        return User.objects.create_user(
            username=data["username"], password=data["password"], role="student"
        )


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ComplaintInputSerializer(serializers.Serializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), required=False, allow_null=True
    )
    original_language = serializers.CharField(default="en")
    incident_at = serializers.DateTimeField(required=False, allow_null=True)
    affected_count = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    extra_data = serializers.DictField(required=False, default=dict)

    def validate(self, attrs):
        cat = attrs["category"]
        schema = cat.form_schema or {}
        for field in schema.get("fields", []):
            if field.get("required") and not attrs.get("extra_data", {}).get(field["name"]):
                raise serializers.ValidationError({field["name"]: "This field is required."})
        return attrs


class ComplaintSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    assigned_officer_username = serializers.CharField(
        source="assigned_officer.username", read_only=True, allow_null=True
    )
    class Meta:
        model = Complaint
        fields = [
            "id", "reference_no", "category", "category_name",
            "title", "description", "status", "is_anonymous", "is_confidential",
            "assigned_department", "assigned_officer", "assigned_officer_username",
            "location", "incident_at", "affected_count", "extra_data",
            "original_language", "created_at", "updated_at",
        ]
        read_only_fields = [
            "reference_no", "status", "is_anonymous", "is_confidential",
            "created_at", "updated_at",
        ]
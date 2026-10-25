from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("auth/login", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh", TokenRefreshView.as_view(), name="refresh"),
    path("auth/register", views.RegisterView.as_view(), name="register"),
    path("auth/me", views.MeView.as_view(), name="me"),
    path("categories/", views.CategoryViewSet.as_view({"get": "list"}), name="categories"),
    path("complaints/", views.ComplaintViewSet.as_view({"get": "list", "post": "create"}), name="complaints"),
    path("complaints/<int:pk>/", views.ComplaintViewSet.as_view({"get": "retrieve"}), name="complaint-detail"),
    path("complaints/<int:pk>/status/", views.ComplaintViewSet.as_view({"post": "status"}), name="complaint-status"),
    path("complaints/<int:pk>/assign/", views.ComplaintViewSet.as_view({"post": "assign"}), name="complaint-assign"),
    path("complaints/<int:pk>/comments/", views.ComplaintViewSet.as_view({"post": "comments"}), name="complaint-comments"),
    path("public/complaints", views.PublicSubmitView.as_view(), name="public-submit"),
    path("public/track", views.PublicTrackView.as_view(), name="public-track"),
]
from django.contrib import admin
from .models import User, Department, Location, Category, Complaint, StatusHistory, Comment

admin.site.register([User, Department, Location, Category, Complaint, StatusHistory, Comment])
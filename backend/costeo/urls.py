from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CosteoRecetaViewSet

router = DefaultRouter()
router.register(r'costeo', CosteoRecetaViewSet, basename='costeo')

urlpatterns = [
    path('', include(router.urls)),
]

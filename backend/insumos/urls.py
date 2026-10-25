from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsumoViewSet

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet, basename='insumo')

urlpatterns = [
    path('', include(router.urls)),
]

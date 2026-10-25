import json
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt

def home_view(request):
    return JsonResponse({
        "sistema": "Atelier Gastronómico API",
        "estado": "Activo",
        "frontend": "http://localhost:5173/",
        "api_endpoints": {
            "auth": "/api/auth/login/",
            "insumos": "/api/insumos/",
            "recetas": "/api/recetas/",
            "costeo": "/api/costeo/"
        }
    })

@csrf_exempt
def auth_login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        data = json.loads(request.body)
        username = str(data.get('username', '')).strip()
        password = str(data.get('password', '')).strip()

        if not username or not password:
            return JsonResponse({"error": "Ingresa usuario y contraseña"}, status=400)

        # Sanitización de longitud para prevenir ataques DoS de cálculo de hash masivo
        if len(username) > 150 or len(password) > 256:
            return JsonResponse({"error": "Longitud de credenciales no permitida"}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            return JsonResponse({
                "ok": True,
                "mensaje": "Inicio de sesión exitoso",
                "usuario": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email or '',
                    "nombre": user.get_full_name() or user.username,
                    "es_admin": user.is_staff or user.is_superuser
                }
            })
        else:
            return JsonResponse({"error": "Usuario o contraseña incorrectos"}, status=401)
    except Exception:
        return JsonResponse({"error": "Ocurrió un error al procesar las credenciales."}, status=500)

@csrf_exempt
def auth_register(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Método no permitido"}, status=405)
    try:
        from django.contrib.auth.models import User
        from insumos.models import Insumo
        from recetas.models import Receta, RecetaIngrediente

        data = json.loads(request.body)
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return JsonResponse({"error": "Usuario y contraseña son requeridos"}, status=400)
        if len(password) < 4:
            return JsonResponse({"error": "La contraseña debe tener al menos 4 caracteres"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": f"El usuario '{username}' ya está registrado. Elige otro nombre."}, status=400)

        # Crear nuevo estudiante
        user = User.objects.create_user(username=username, email=email, password=password, first_name=username)

        # Iniciar sesión automáticamente
        login(request, user)

        return JsonResponse({
            "ok": True,
            "mensaje": "Cuenta creada con éxito",
            "usuario": {
                "id": user.id,
                "username": user.username,
                "email": user.email or '',
                "nombre": user.get_full_name() or user.username,
                "es_admin": False
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Error al registrar: {str(e)}"}, status=500)

@csrf_exempt
def auth_logout(request):
    logout(request)
    return JsonResponse({"ok": True, "mensaje": "Sesión cerrada correctamente"})

def auth_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "autenticado": True,
            "usuario": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email or '',
                "nombre": request.user.get_full_name() or request.user.username,
                "es_admin": request.user.is_staff or request.user.is_superuser
            }
        })
    return JsonResponse({"autenticado": False}, status=200)

@csrf_exempt
def auth_update_profile(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Método no permitido"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "No has iniciado sesión"}, status=401)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '').strip()

        user = request.user

        # Si se va a cambiar la contraseña, validar la contraseña actual
        if new_password:
            if not current_password:
                return JsonResponse({"error": "Debes ingresar tu contraseña actual para cambiarla"}, status=400)
            if not user.check_password(current_password):
                return JsonResponse({"error": "La contraseña actual es incorrecta"}, status=400)
            if len(new_password) < 4:
                return JsonResponse({"error": "La nueva contraseña debe tener al menos 4 caracteres"}, status=400)
            user.set_password(new_password)

        # Actualizar email
        user.email = email
        user.save()

        # Mantener la sesión activa si la contraseña cambió
        if new_password:
            login(request, user)

        return JsonResponse({
            "ok": True,
            "mensaje": "Perfil actualizado exitosamente",
            "usuario": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "nombre": user.get_full_name() or user.username,
                "es_admin": user.is_staff or user.is_superuser
            }
        })
    except Exception as e:
        return JsonResponse({"error": f"Error al actualizar perfil: {str(e)}"}, status=500)

@csrf_exempt
def auth_delete_account(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Método no permitido"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "No has iniciado sesión"}, status=401)
    try:
        data = json.loads(request.body)
        password = data.get('password', '')

        if not password:
            return JsonResponse({"error": "Debes ingresar tu contraseña para confirmar la eliminación de la cuenta"}, status=400)

        user = request.user
        if not user.check_password(password):
            return JsonResponse({"error": "Contraseña incorrecta. No se puede eliminar la cuenta."}, status=400)

        # Borrar primero las relaciones de ingredientes y recetas para evitar restricciones de PROTECT
        from recetas.models import RecetaIngrediente
        # Eliminar cualquier uso de insumos de este usuario en recetas
        RecetaIngrediente.objects.filter(insumo__usuario=user).delete()
        # Eliminar las recetas creadas por este usuario (y sus ingredientes en cascada)
        user.recetas.all().delete()
        # Ahora sí, eliminar los insumos propios del usuario sin bloqueos
        user.insumos.all().delete()
        # Finalmente eliminar la cuenta del usuario
        user.delete()
        logout(request)

        return JsonResponse({"ok": True, "mensaje": "Cuenta y datos eliminados correctamente"})
    except Exception as e:
        return JsonResponse({"error": f"Error al eliminar cuenta: {str(e)}"}, status=500)

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/login/', auth_login, name='api_auth_login'),
    path('api/auth/register/', auth_register, name='api_auth_register'),
    path('api/auth/logout/', auth_logout, name='api_auth_logout'),
    path('api/auth/user/', auth_user, name='api_auth_user'),
    path('api/auth/update-profile/', auth_update_profile, name='api_auth_update_profile'),
    path('api/auth/delete-account/', auth_delete_account, name='api_auth_delete_account'),
    path('api/', include('insumos.urls')),
    path('api/', include('recetas.urls')),
    path('api/', include('costeo.urls')),
]


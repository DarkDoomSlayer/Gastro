#!/bin/sh
set -e

echo "=== Iniciando Backend Django para Gastronomía ==="

# Esperar a que PostgreSQL esté listo si está configurado
if [ "$DB_ENGINE" = "postgres" ] || [ -n "$DB_HOST" ]; then
  echo "Esperando que la base de datos PostgreSQL ($DB_HOST:$DB_PORT) esté disponible..."
  while ! nc -z ${DB_HOST:-db} ${DB_PORT:-5432} 2>/dev/null; do
    sleep 1
  done
  echo "PostgreSQL está listo."
fi

# Aplicar migraciones automáticamente
echo "Aplicando migraciones de base de datos..."
python manage.py makemigrations insumos recetas costeo --noinput || true
python manage.py migrate --noinput

# Precargar los insumos base automáticamente si la base de datos está vacía
echo "Verificando catálogo inicial de insumos..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from insumos.models import Insumo
if Insumo.objects.count() == 0:
    import seed_insumos
    print('Insumos precargados automáticamente.')
else:
    print(f'Catálogo ya cuenta con {Insumo.objects.count()} insumos.')
" || true

# Crear usuarios base para estudiantes y docente si no existen
echo "Verificando usuarios iniciales..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User

# Usuario Administrador / Docente
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gastronomia.edu', 'admin123')
    print('Usuario admin creado (admin / admin123).')

# Usuario Estudiante
if not User.objects.filter(username='estudiante').exists():
    User.objects.create_user('estudiante', 'estudiante@gastronomia.edu', 'estudiante123', first_name='Estudiante', last_name='Gastronomía')
    print('Usuario estudiante creado (estudiante / estudiante123).')
" || true

echo "=== Arrancando servidor Django REST Framework ==="
exec "$@"

@echo off
chcp 65001 >nul
echo ========================================================
echo   Iniciando Atelier Gastronomico con Docker y Cloudflare
echo ========================================================
echo.
docker compose up -d

echo.
echo Esperando generacion del enlace publico Cloudflare...
timeout /t 6 /nobreak >nul

echo.
echo ========================================================
echo   ENLACE PUBLICO PARA ESTUDIANTES (Celulares y Laptops):
echo ========================================================
docker logs gastro_cloudflare 2>&1 | findstr trycloudflare.com
echo ========================================================
echo.
echo Acceso Local: http://localhost:5173/
echo Usuarios precargados:
echo   - Estudiante: estudiante / estudiante123
echo   - Docente/Admin: admin / admin123
echo ========================================================
echo.
pause

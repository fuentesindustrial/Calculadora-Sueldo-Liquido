@echo off
title SueldoLiquido.cl
cd /d "%~dp0"

echo Iniciando SueldoLiquido.cl...

:: Verificar si el puerto 5174 ya esta en uso
netstat -ano | findstr ":5174" >nul 2>&1
if %errorlevel% == 0 (
    echo Servidor ya en ejecucion. Abriendo navegador...
    start "" "http://localhost:5174"
    exit
)

:: Iniciar servidor Vite en segundo plano
start /b cmd /c "npm run dev -- --port 5174 > nul 2>&1"

:: Esperar que el servidor arranque
echo Esperando que el servidor inicie...
timeout /t 4 /nobreak > nul

:: Abrir en el navegador predeterminado
start "" "http://localhost:5174"

echo Listo. Puedes cerrar esta ventana cuando termines de usar la app.
echo (El servidor seguira corriendo en segundo plano)

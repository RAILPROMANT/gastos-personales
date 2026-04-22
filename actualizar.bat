@echo off
chcp 65001 >nul
title Actualizar Gastos en Vercel
color 0B

echo.
echo  ================================================
echo   ACTUALIZAR GASTOS EN GITHUB + VERCEL
echo  ================================================
echo.

cd /d "%~dp0"

REM Verificar que estamos en un repo git
if not exist ".git" (
    echo  [ERROR] Esta carpeta no es un repositorio Git.
    echo  Copia este .bat dentro de la carpeta "gastos-personales".
    echo.
    pause
    exit /b 1
)

echo  Carpeta: %CD%
echo.

REM Mostrar archivos modificados
echo  Archivos modificados:
git status --short
echo.

REM Verificar si hay cambios
git diff --quiet HEAD
if %ERRORLEVEL% EQU 0 (
    git diff --cached --quiet
    if %ERRORLEVEL% EQU 0 (
        echo  [INFO] No hay cambios para subir.
        echo.
        pause
        exit /b 0
    )
)

REM Pedir mensaje de commit
set /p MSG="  Descripcion del cambio (Enter = 'update'): "
if "%MSG%"=="" set MSG=update

echo.
echo  Subiendo cambios a GitHub...
echo.

git add .
if %ERRORLEVEL% NEQ 0 goto :error

git commit -m "%MSG%"
if %ERRORLEVEL% NEQ 0 goto :error

git push
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo  ================================================
echo   LISTO! Vercel va a redesplegar en 30 segundos.
echo  ================================================
echo.
echo  URL: https://gastos-personales-nine.vercel.app
echo.
pause
exit /b 0

:error
echo.
echo  [ERROR] Algo fallo. Revisa el mensaje de arriba.
echo.
pause
exit /b 1

@echo off
echo ========================================
echo   Menu Digital - Serveur Local
echo ========================================
echo.
echo Demarrage du serveur...
echo.
echo L'application va s'ouvrir dans votre navigateur
echo.
echo Pour arreter le serveur : Fermez cette fenetre
echo ========================================
echo.

cd /d "%~dp0"

:: Essayer Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Python
    start http://localhost:8000
    python -m http.server 8000
    goto :end
)

:: Essayer py (Python launcher)
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Python
    start http://localhost:8000
    py -m http.server 8000
    goto :end
)

:: Si pas de Python
echo.
echo ERREUR: Python n'est pas installe
echo.
echo Solutions alternatives :
echo 1. Installez Python depuis https://www.python.org/downloads/
echo 2. Ou utilisez l'extension "Live Server" dans VS Code
echo 3. Ou ouvrez index.html avec Chrome et utilisez l'extension "Web Server for Chrome"
echo.
pause

:end

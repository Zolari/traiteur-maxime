@echo off
echo ========================================
echo   Menu Digital - Serveur Reseau Local
echo ========================================
echo.
echo Demarrage du serveur accessible sur le reseau...
echo.

cd /d "%~dp0"

:: Récupérer l'adresse IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :ip_found
)

:ip_found
:: Nettoyer l'IP (enlever les espaces)
set IP=%IP: =%

:: Essayer Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Python
    echo.
    echo ========================================
    echo   SERVEUR DEMARRE !
    echo ========================================
    echo.
    echo Sur cet ordinateur :
    echo   http://localhost:8000
    echo.
    echo Sur votre TV ou autres appareils :
    echo   http://%IP%:8000
    echo.
    echo ========================================
    echo.
    echo Pour arreter le serveur : Fermez cette fenetre
    echo.
    start http://localhost:8000
    python -m http.server 8000 --bind 0.0.0.0
    goto :end
)

:: Essayer py (Python launcher)
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Python
    echo.
    echo ========================================
    echo   SERVEUR DEMARRE !
    echo ========================================
    echo.
    echo Sur cet ordinateur :
    echo   http://localhost:8000
    echo.
    echo Sur votre TV ou autres appareils :
    echo   http://%IP%:8000
    echo.
    echo ========================================
    echo.
    echo Pour arreter le serveur : Fermez cette fenetre
    echo.
    start http://localhost:8000
    py -m http.server 8000 --bind 0.0.0.0
    goto :end
)

:: Si pas de Python
echo.
echo ERREUR: Python n'est pas installe
echo.
echo Solutions alternatives :
echo 1. Installez Python depuis https://www.python.org/downloads/
echo 2. Ou utilisez l'extension "Live Server" dans VS Code
echo.
pause

:end

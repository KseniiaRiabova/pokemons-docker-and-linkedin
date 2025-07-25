@echo off
REM Helper script for Docker operations on Windows

setlocal EnableDelayedExpansion

REM Print header
echo ========================================
echo  Pokemon LinkedIn Docker Helper Script
echo ========================================
echo.

REM Function to check if docker is running
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not running.
    echo Please start Docker and try again.
    exit /b 1
)

REM Display usage information
if "%~1"=="" (
    goto :usage
)

REM Process command
if "%~1"=="start" (
    echo Starting Pokemon LinkedIn application...
    docker-compose up -d
    echo Application is running at http://localhost:3000
    goto :EOF
)

if "%~1"=="stop" (
    echo Stopping Pokemon LinkedIn application...
    docker-compose down
    echo Application stopped
    goto :EOF
)

if "%~1"=="restart" (
    echo Restarting Pokemon LinkedIn application...
    docker-compose restart
    echo Application restarted
    goto :EOF
)

if "%~1"=="logs" (
    echo Showing logs (Ctrl+C to exit)...
    docker-compose logs -f
    goto :EOF
)

if "%~1"=="status" (
    echo Container status:
    docker-compose ps
    goto :EOF
)

if "%~1"=="shell" (
    echo Opening shell in web container...
    docker-compose exec web sh
    goto :EOF
)

if "%~1"=="mongo-shell" (
    echo Opening MongoDB shell...
    docker-compose exec mongo mongosh -u admin -p pokemon123 pokemon_db
    goto :EOF
)

if "%~1"=="clean" (
    echo WARNING: This will remove all containers and volumes!
    set /p choice=Are you sure you want to continue? (y/N) 
    if /i "!choice!"=="y" (
        echo Removing containers and volumes...
        docker-compose down -v
        echo Cleanup complete
    ) else (
        echo Operation cancelled
    )
    goto :EOF
)

if "%~1"=="rebuild" (
    echo Rebuilding and restarting containers...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo Rebuild complete. Application is running at http://localhost:3000
    goto :EOF
)

if "%~1"=="help" (
    goto :usage
) else (
    goto :usage
)

:usage
echo Usage: %~nx0 COMMAND
echo.
echo Commands:
echo   start        Start the application
echo   stop         Stop the application
echo   restart      Restart the application
echo   logs         View container logs
echo   status       View container status
echo   shell        Open shell in web container
echo   mongo-shell  Open MongoDB shell
echo   clean        Remove all containers and volumes
echo   rebuild      Rebuild and restart containers
echo   help         Display this help message
echo.

exit /b 0

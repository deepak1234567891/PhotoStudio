@echo off
REM PhotoStudio Staging Deployment Script for Windows

echo ==========================================
echo PhotoStudio Staging Deployment
echo ==========================================
echo.

REM Check if git is available
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed
    exit /b 1
)
echo [OK] Git is available

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not in a git repository
    exit /b 1
)
echo [OK] Git repository detected

REM Check current branch
for /f "delims=" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo Current branch: %CURRENT_BRANCH%

if not "%CURRENT_BRANCH%"=="main" (
    echo WARNING: You're not on the main branch
    set /p SWITCH="Do you want to switch to main branch? (y/n): "
    if /i "%SWITCH%"=="y" (
        git checkout main
        echo [OK] Switched to main branch
    ) else (
        echo ERROR: Deployment should be done from main branch
        exit /b 1
    )
)

REM Check for uncommitted changes
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    echo WARNING: You have uncommitted changes
    git status --short
    set /p COMMIT="Do you want to commit and push these changes? (y/n): "
    if /i "%COMMIT%"=="y" (
        set /p MSG="Enter commit message: "
        git add .
        git commit -m "%MSG%"
        echo [OK] Changes committed
    ) else (
        echo ERROR: Please commit or stash changes before deployment
        exit /b 1
    )
)

REM GitHub Secrets Check
echo.
echo Checking GitHub Secrets configuration...
echo Please ensure the following secrets are configured in your GitHub repository:
echo   - SSH_PRIVATE_KEY
echo   - SERVER_USER
echo   - STAGING_SERVER_IP
echo   - DOCKER_USERNAME (optional)
echo   - DOCKER_PASSWORD (optional)
echo.
set /p SECRETS="Have you configured these secrets? (y/n): "
if /i not "%SECRETS%"=="y" (
    echo ERROR: Please configure GitHub secrets first
    echo Go to: https://github.com/deepak1234567891/PhotoStudio/settings/secrets/actions
    exit /b 1
)

REM Staging Server Check
echo.
echo Staging Server Configuration
set /p SERVER_IP="Enter your staging server IP: "
echo Testing SSH connection to %SERVER_IP%...

plink -batch ubuntu@%SERVER_IP% exit >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to staging server
    echo Please ensure:
    echo   - Server IP is correct
    echo   - SSH key is copied to server
    echo   - Server is accessible
    exit /b 1
)
echo [OK] SSH connection successful

REM Final confirmation
echo.
echo ==========================================
echo Ready to deploy to staging
echo ==========================================
echo Server: %SERVER_IP%
echo Branch: main
echo.
set /p DEPLOY="Do you want to proceed with deployment? (y/n): "
if /i not "%DEPLOY%"=="y" (
    echo ERROR: Deployment cancelled
    exit /b 0
)

REM Push to trigger CI/CD
echo.
echo Pushing to main branch to trigger CI/CD deployment...
git push origin main

if %errorlevel% equ 0 (
    echo [OK] Code pushed successfully
    echo.
    echo ==========================================
    echo Deployment Triggered
    echo ==========================================
    echo Monitor the deployment at:
    echo https://github.com/deepak1234567891/PhotoStudio/actions
    echo.
    echo After successful deployment, access the application at:
    echo   Frontend: http://%SERVER_IP%:3000
    echo   Backend: http://%SERVER_IP%:8000
    echo   API Docs: http://%SERVER_IP%:8000/docs
    echo.
    echo Default credentials: admin / admin123
    echo ==========================================
) else (
    echo ERROR: Failed to push to GitHub
    exit /b 1
)

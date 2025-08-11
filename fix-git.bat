@echo off
echo Fixing Git repository setup...
echo.

echo Current directory: %CD%
echo.

echo Checking if we're in the right directory...
if not exist "package.json" (
    echo ERROR: package.json not found. Make sure you're in the rmac-officials project directory.
    pause
    exit /b 1
)

echo Removing existing Git repository...
if exist ".git" (
    rmdir /s /q .git
    echo Old .git directory removed.
) else (
    echo No existing .git directory found.
)

echo.
echo Initializing fresh Git repository in project directory...
git init

echo.
echo Adding project files...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit - RMAC Officials PWA (fixed repository)"

echo.
echo Setting up remote and pushing...
git branch -M main
git remote add origin https://github.com/redlegbrewco/rmac-officials-pwa.git

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Git repository fixed and pushed successfully!
pause

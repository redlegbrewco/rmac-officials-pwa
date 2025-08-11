@echo off
echo Fixing Git repository setup...
echo.

echo Current directory: %CD%
echo.

echo Checking if we're in the right directory...
if not exist "components" (
    echo ERROR: components directory not found. Make sure you're in the rmac-officials project directory.
    pause
    exit /b 1
)

echo.
echo Checking Git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Checking what will be committed...
git status

echo.
echo Creating commit with changes...
git commit -m "Fix component structure and add Google Sheets sync"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Git operations complete!
echo.
echo If you see "Everything up-to-date", your changes are already on GitHub.
echo If you see errors, check the output above for details.
pause
echo Pushing to GitHub...
git push -u origin main

echo.
echo Git repository fixed and pushed successfully!
pause

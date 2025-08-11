@echo off
echo Setting up Git repository for RMAC Officials PWA...
echo.

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding all files to Git...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit - RMAC Officials PWA"

echo.
echo Step 4: Setting up main branch and remote...
git branch -M main
git remote add origin https://github.com/redlegbrewco/rmac-officials-pwa.git

echo.
echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo Git setup complete! Your RMAC Officials PWA is now on GitHub.
pause

@echo off
echo Starting Mkononi Platform...

echo Starting Backend...
start cmd /k "cd mk_backend && python manage.py runserver"

timeout /t 3

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Platform is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
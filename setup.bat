@echo off
echo Setting up Mkononi Platform...

echo.
echo 1. Setting up Backend...
cd mk_backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo Creating superuser...
python manage.py createsuperuser

echo Collecting static files...
python manage.py collectstatic --noinput

echo.
echo 2. Setting up Frontend...
cd ..\frontend

echo Installing Node dependencies...
npm install

echo.
echo 3. Setup complete!
echo.
echo To start the platform:
echo Backend: cd mk_backend && python manage.py runserver
echo Frontend: cd frontend && npm run dev
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/api
echo - Admin Panel: http://localhost:8000/admin
echo - API Docs: http://localhost:8000/api/docs
echo.
pause
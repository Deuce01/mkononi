@echo off
echo 🚀 Deploying Mkononi Platform...

echo.
echo 1. Building Docker images...
docker-compose -f docker-compose.prod.yml build

echo.
echo 2. Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo.
echo 3. Running migrations...
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

echo.
echo 4. Creating superuser and sample data...
docker-compose -f docker-compose.prod.yml exec backend python manage.py setup_production

echo.
echo 5. Collecting static files...
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

echo.
echo 6. Running health checks...
timeout /t 10
python mk_backend\health_check.py

echo.
echo 🎉 Deployment complete!
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo - Admin: http://localhost:8000/admin
echo - API Docs: http://localhost:8000/api/docs
echo.
pause
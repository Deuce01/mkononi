#!/usr/bin/env python
"""
Health check script for production monitoring
"""

import requests
import sys
import os

def check_backend():
    try:
        response = requests.get('http://localhost:8000/health/', timeout=10)
        if response.status_code == 200:
            print("✅ Backend: Healthy")
            return True
        else:
            print(f"❌ Backend: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend: {e}")
        return False

def check_database():
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mkononi_backend.settings')
        import django
        django.setup()
        
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        print("✅ Database: Connected")
        return True
    except Exception as e:
        print(f"❌ Database: {e}")
        return False

def check_redis():
    try:
        import redis
        from decouple import config
        
        redis_url = config('REDIS_URL', default='redis://localhost:6379/0')
        r = redis.from_url(redis_url)
        r.ping()
        print("✅ Redis: Connected")
        return True
    except Exception as e:
        print(f"❌ Redis: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Running health checks...")
    
    checks = [
        check_backend(),
        check_database(),
        check_redis()
    ]
    
    if all(checks):
        print("🎉 All systems healthy!")
        sys.exit(0)
    else:
        print("⚠️ Some systems unhealthy!")
        sys.exit(1)
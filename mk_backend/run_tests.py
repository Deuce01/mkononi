#!/usr/bin/env python
"""
Test runner for Mkononi Backend
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    os.environ['DJANGO_SETTINGS_MODULE'] = 'mkononi_backend.settings'
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Run specific test modules
    test_modules = [
        'core.tests.ModelTests',
        'core.tests.MatchingTests', 
        'core.tests.APITests',
        'core.tests.WebhookTests'
    ]
    
    print("Running Mkononi Backend Tests...")
    print("=" * 50)
    
    failures = test_runner.run_tests(test_modules)
    
    if failures:
        print(f"\n❌ {failures} test(s) failed")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)
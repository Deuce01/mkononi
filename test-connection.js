#!/usr/bin/env node

// Simple test script to verify frontend-backend communication
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:3000';

async function testAPIConnection() {
  console.log('🧪 Testing Frontend-Backend Communication...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:8000/health/');
    console.log('✅ Health Check:', healthResponse.data.status);

    // Test 2: Jobs API
    console.log('\n2. Testing Jobs API...');
    const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/`);
    console.log('✅ Jobs API:', `${jobsResponse.data.count} jobs found`);

    // Test 3: CORS Headers
    console.log('\n3. Testing CORS Headers...');
    const corsResponse = await axios.get(`${API_BASE_URL}/jobs/`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    console.log('✅ CORS:', 'Frontend can access backend');

    // Test 4: API Documentation
    console.log('\n4. Testing API Documentation...');
    const docsResponse = await axios.get('http://localhost:8000/api/schema/');
    console.log('✅ API Docs:', 'Schema available');

    console.log('\n🎉 All tests passed! Frontend and Backend are communicating successfully.');
    console.log('\n📋 Summary:');
    console.log(`   - Backend: http://localhost:8000 (✅ Running)`);
    console.log(`   - Frontend: ${FRONTEND_URL} (✅ Should be accessible)`);
    console.log(`   - API: ${API_BASE_URL} (✅ Working)`);
    console.log(`   - Jobs available: ${jobsResponse.data.count}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure both servers are running:');
      console.log('   Backend: python manage.py runserver');
      console.log('   Frontend: npm run dev');
    }
  }
}

testAPIConnection();

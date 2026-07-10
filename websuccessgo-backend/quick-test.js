// Quick validation test
require('dotenv').config();
const validateEnv = require('./utils/envValidator');
const logger = require('./utils/logger');

console.log('🔍 Running Quick Validation Tests...\n');

// Test 1: Environment Variables
console.log('1. Testing Environment Variables...');
try {
  validateEnv();
  console.log('   ✅ Environment variables validated\n');
} catch (error) {
  console.log('   ❌ Environment validation failed:', error.message);
  console.log('   ℹ️  Copy .env.example to .env and fill in values\n');
}

// Test 2: Logger
console.log('2. Testing Logger...');
try {
  logger.info('Test log message');
  logger.error('Test error message');
  console.log('   ✅ Logger working\n');
} catch (error) {
  console.log('   ❌ Logger failed:', error.message, '\n');
}

// Test 3: Validators
console.log('3. Testing Validators...');
try {
  const { registerSchema, loginSchema } = require('./utils/validators');
  
  // Valid test
  const validResult = registerSchema.validate({
    name: 'Test User',
    email: 'test@test.com',
    password: 'Test@123'
  });
  
  if (!validResult.error) {
    console.log('   ✅ Validation schemas working\n');
  }
  
  // Invalid test
  const invalidResult = registerSchema.validate({
    name: 'T',
    email: 'invalid',
    password: 'weak'
  });
  
  if (invalidResult.error) {
    console.log('   ✅ Validation correctly catching errors\n');
  }
} catch (error) {
  console.log('   ❌ Validator test failed:', error.message, '\n');
}

// Test 4: File Structure
console.log('4. Checking File Structure...');
const fs = require('fs');
const path = require('path');

const requiredDirs = ['controllers', 'models', 'routes', 'middleware', 'utils', 'uploads', 'invoices'];
const requiredFiles = ['server.js', 'package.json', '.env.example'];

let structureValid = true;

requiredDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    console.log(`   ❌ Missing directory: ${dir}`);
    structureValid = false;
  }
});

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ❌ Missing file: ${file}`);
    structureValid = false;
  }
});

if (structureValid) {
  console.log('   ✅ All required files and directories present\n');
}

// Test 5: Dependencies
console.log('5. Checking Dependencies...');
try {
  require('express');
  require('mongoose');
  require('jsonwebtoken');
  require('bcrypt');
  require('joi');
  require('winston');
  require('razorpay');
  console.log('   ✅ All core dependencies installed\n');
} catch (error) {
  console.log('   ❌ Missing dependency:', error.message, '\n');
}

console.log('═══════════════════════════════════════════════════');
console.log('✅ Quick validation complete!');
console.log('');
console.log('📝 Next Steps:');
console.log('   1. Ensure .env file exists with correct values');
console.log('   2. Make sure MongoDB is running');
console.log('   3. Run: npm run dev');
console.log('   4. Test endpoints using TESTING.md');
console.log('═══════════════════════════════════════════════════');

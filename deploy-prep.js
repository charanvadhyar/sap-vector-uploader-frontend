#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * Helps prepare the SAP FICO Uploader for deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 SAP FICO Uploader - Deployment Preparation\n');

// Generate a secure secret key
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'backend/requirements.txt',
    'backend/app/main.py',
    '.env.example'
  ];

  console.log('📋 Checking required files...');
  
  const missing = [];
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missing.push(file);
    } else {
      console.log(`✅ ${file}`);
    }
  });

  if (missing.length > 0) {
    console.log('\n❌ Missing required files:');
    missing.forEach(file => console.log(`   - ${file}`));
    return false;
  }
  
  return true;
}

// Create production environment template
function createProductionEnv() {
  const secretKey = generateSecretKey();
  
  const backendEnv = `# Production Backend Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=${secretKey}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key-here
`;

  const frontendEnv = `# Production Frontend Environment Variables
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=SAP FICO Vector Uploader
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
`;

  // Write backend env template
  if (!fs.existsSync('backend/.env.production')) {
    fs.writeFileSync('backend/.env.production', backendEnv);
    console.log('✅ Created backend/.env.production template');
  }

  // Write frontend env template
  if (!fs.existsSync('.env.production')) {
    fs.writeFileSync('.env.production', frontendEnv);
    console.log('✅ Created .env.production template');
  }

  console.log(`\n🔑 Generated SECRET_KEY: ${secretKey}`);
  console.log('⚠️  Save this key securely - you\'ll need it for deployment!');
}

// Main execution
function main() {
  if (checkRequiredFiles()) {
    console.log('\n✅ All required files present');
    createProductionEnv();
    
    console.log('\n🎉 Deployment preparation complete!');
    console.log('\n📖 Next steps:');
    console.log('1. Update .env.production with your actual values');
    console.log('2. Update backend/.env.production with your database URL and API keys');
    console.log('3. Follow the DEPLOYMENT.md guide for hosting');
    console.log('4. Test your deployment thoroughly');
  } else {
    console.log('\n❌ Please fix missing files before deployment');
    process.exit(1);
  }
}

main();

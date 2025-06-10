// Simple Supabase Connection Test
// Run with: node test-connection.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🔍 Testing Supabase Connection...\n');

// Read environment variables from .env file
let supabaseUrl, supabaseKey;

try {
  const envContent = readFileSync('.env', 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  supabaseUrl = envVars.VITE_SUPABASE_URL;
  supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found in .env file');
  }
  
  console.log('✅ Environment variables loaded');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...`);
  
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  console.log('\n📝 Please create a .env file with:');
  console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  process.exit(1);
}

// Test connection
async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n🔗 Testing database connection...');
    
    // Test basic query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${data.length} tables in public schema:`);
    data.forEach(table => console.log(`   - ${table.table_name}`));
    
    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError && authError.message !== 'Auth session missing!') {
      throw authError;
    }
    
    console.log('✅ Authentication system is working');
    
    // Check if required tables exist
    console.log('\n🗄️ Checking required tables...');
    const requiredTables = ['profiles', 'prizes', 'bonus_entries', 'prize_redemptions'];
    const existingTables = data.map(t => t.table_name);
    
    let missingTables = [];
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' is missing`);
        missingTables.push(table);
      }
    });
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Some tables are missing. Run setup.sql in Supabase SQL Editor.');
    } else {
      console.log('\n🎉 All required tables are present!');
    }
    
    console.log('\n✨ Database setup looks good! You can start development with:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase URL and API key');
    console.log('2. Ensure your Supabase project is not paused');
    console.log('3. Verify your internet connection');
    process.exit(1);
  }
}

testConnection(); 
// Test Google Sheets API Connection
// Run with: node test-google-sheets.js

const { google } = require('googleapis');

async function testGoogleSheetsConnection() {
  console.log('🧪 Testing Google Sheets API connection...\n');

  // Check environment variables
  const requiredEnvVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'RMAC_MASTER_SHEET_ID'
  ];

  console.log('1. Checking environment variables...');
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('\nPlease add these to your .env.local file:');
    missingVars.forEach(varName => {
      console.log(`${varName}=your-value-here`);
    });
    return;
  }
  console.log('✅ All environment variables found\n');

  try {
    // Initialize Google Auth
    console.log('2. Initializing Google Auth...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
    console.log('✅ Google Auth initialized\n');

    // Initialize Sheets API
    console.log('3. Connecting to Google Sheets API...');
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Connected to Google Sheets API\n');

    // Test sheet access
    console.log('4. Testing sheet access...');
    const sheetId = process.env.RMAC_MASTER_SHEET_ID;
    
    // Try to read sheet properties
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });
    
    console.log(`✅ Successfully accessed sheet: "${sheetInfo.data.properties?.title}"`);
    console.log(`   Sheet ID: ${sheetId}`);
    console.log(`   Number of tabs: ${sheetInfo.data.sheets?.length || 0}`);
    
    if (sheetInfo.data.sheets) {
      console.log('   Tabs found:');
      sheetInfo.data.sheets.forEach(sheet => {
        console.log(`   - ${sheet.properties?.title}`);
      });
    }
    console.log('');

    // Test writing data
    console.log('5. Testing write access...');
    const testData = [
      ['Test Date', 'Test Data'],
      [new Date().toISOString(), 'API Connection Test Successful']
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:B',
      valueInputOption: 'RAW',
      requestBody: {
        values: testData
      }
    });
    
    console.log('✅ Successfully wrote test data to sheet\n');

    console.log('🎉 All tests passed! Your Google Sheets API is ready to use.');
    console.log('\nYou can now:');
    console.log('- Run your PWA: npm run dev');
    console.log('- Try the "Sync to Google Sheets" button');
    console.log('- Add penalties and see them appear in your sheet');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n💡 This looks like a permissions issue.');
      console.log('Make sure you:');
      console.log('1. Shared your Google Sheet with the service account email');
      console.log('2. Gave the service account "Editor" permissions');
      console.log('3. Used the correct Sheet ID from the URL');
    }
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Sheet not found.');
      console.log('Check that your RMAC_MASTER_SHEET_ID is correct.');
      console.log('It should be the long ID from your Google Sheets URL.');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testGoogleSheetsConnection().catch(console.error);

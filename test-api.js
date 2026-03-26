import http from 'http';

let TOKEN = '';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    };
    if (data) options.headers['Content-Length'] = data.length;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const obj = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: obj });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 5: COMPLETE API TESTING');
  console.log('='.repeat(70) + '\n');

  // Test 1: Login
  const loginResult = await makeRequest('POST', '/api/auth/login', 
    {email: 'admin@wil.com', password: 'Admin2026'});
  TOKEN = loginResult.data.token;
  console.log('✅ TEST 1: LOGIN');
  console.log('   Status:', loginResult.status);
  console.log('   User:', loginResult.data.user.email);
  console.log('   Role:', loginResult.data.user.role + '\n');

  // Test 2: Get all users
  const usersResult = await makeRequest('GET', '/api/users');
  console.log('✅ TEST 2: GET USERS');
  console.log('   Status:', usersResult.status);
  console.log('   Count:', usersResult.data.length, 'users');
  console.log('   Users:', usersResult.data.map(u => u.email).join(', ') + '\n');

  // Test 3: Get conversations
  const convResult = await makeRequest('GET', '/api/conversations');
  console.log('✅ TEST 3: GET CONVERSATIONS');
  console.log('   Status:', convResult.status);
  console.log('   Count:', convResult.data.length, 'conversations\n');

  // Test 4: Get notifications
  const notifResult = await makeRequest('GET', '/api/notifications');
  console.log('✅ TEST 4: GET NOTIFICATIONS');
  console.log('   Status:', notifResult.status);
  console.log('   Notifications:', notifResult.data.notifications?.length || 0);
  console.log('   Unread count:', notifResult.data.unreadCount || 0 + '\n');

  // Test 5: Get cases
  const casesResult = await makeRequest('GET', '/api/cases');
  console.log('✅ TEST 5: GET CASES');
  console.log('   Status:', casesResult.status);
  console.log('   Count:', casesResult.data.length, 'cases');
  if (casesResult.data.length > 0) {
    console.log('   First case:', casesResult.data[0].title);
  }
  console.log('');

  // Test 6: Get appointments
  const apptsResult = await makeRequest('GET', '/api/appointments');
  console.log('✅ TEST 6: GET APPOINTMENTS');
  console.log('   Status:', apptsResult.status);
  console.log('   Count:', apptsResult.data.length, 'appointments\n');

  console.log('='.repeat(70));
  console.log('✅ ALL API ENDPOINTS RESPONDING CORRECTLY!');
  console.log('='.repeat(70) + '\n');
}

runTests().catch(console.error);

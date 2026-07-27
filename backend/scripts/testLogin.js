const axios = require('axios');

const email = process.argv[2] || 'test@example.com';
const password = process.argv[3] || 'secret123';
const base = process.argv[4] || process.env.API_URL || 'http://localhost:8080/api';

async function run() {
  console.log(`Attempting login to ${base}/auth/login with ${email}`);
  try {
    const res = await axios.post(`${base}/auth/login`, { email, password }, { timeout: 10000 });
    console.log('Status:', res.status);
    console.log('Response body:', JSON.stringify(res.data, null, 2));
    if (res.data && res.data.token) {
      console.log('\nReceived token (truncated):', res.data.token.slice(0, 60) + '...');
    }
  } catch (err) {
    if (err.response) {
      console.error('HTTP error:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('Connection error:', err.code, '- cannot reach server at', base);
    } else if (err.code === 'ETIMEDOUT') {
      console.error('Request timed out when connecting to', base);
    } else {
      console.error('Unexpected error:', err.message || err);
    }
    process.exitCode = 1;
  }
}

run();

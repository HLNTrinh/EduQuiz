require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// Build a MongoDB URI that includes auth if root credentials are provided.
function buildMongoUri() {
  const envUri = process.env.MONGO_URI;
  const rootUser = process.env.MONGO_ROOT_USER;
  const rootPass = process.env.MONGO_ROOT_PASSWORD;
  const dbName = process.env.MONGO_DB || (envUri && envUri.split('/')[3]) || '';

  if (rootUser && rootPass) {
    // If envUri exists, extract host:port; otherwise default to localhost:27017
    let hostPart = 'localhost:27017';
    if (envUri) {
      const withoutPrefix = envUri.replace(/^mongodb:\/\//, '');
      hostPart = withoutPrefix.split('/')[0];
    }
    return `mongodb://${encodeURIComponent(rootUser)}:${encodeURIComponent(rootPass)}@${hostPart}/${dbName}?authSource=admin`;
  }

  if (envUri) return envUri;

  return null;
}

const mongoUri = buildMongoUri();

if (!mongoUri) {
  console.error('MONGO_URI or MONGO_ROOT_USER/MONGO_ROOT_PASSWORD must be set in backend/.env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(mongoUri);

  const email = process.argv[2] || 'test@example.com';
  const name = process.argv[3] || 'Test User';
  const password = process.argv[4] || 'password123';

  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    console.log(`User already exists: ${existing.email} (${existing._id})`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: 'student',
  });

  console.log('Created user:');
  console.log(`  _id: ${user._id}`);
  console.log(`  name: ${user.name}`);
  console.log(`  email: ${user.email}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error creating test user:', err.message || err);
  process.exit(1);
});

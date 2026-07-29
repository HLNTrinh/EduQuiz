require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

function buildMongoUri() {
  const envUri = process.env.MONGO_URI;
  if (envUri) return envUri;
  return 'mongodb://admin:secret@localhost:27017/examdb?authSource=admin';
}

async function run() {
  await mongoose.connect(buildMongoUri());
  console.log('✅ Connected to MongoDB');

  // Cập nhật tất cả quiz có maxAttempts = 1 thành 999
  const result = await Quiz.updateMany(
    { maxAttempts: { $lte: 1 } },
    { $set: { maxAttempts: 999 } }
  );

  console.log(`✅ Updated ${result.modifiedCount} quizzes - now allows unlimited attempts`);
  
  // Kiểm tra lại
  const remaining = await Quiz.countDocuments({ maxAttempts: { $lte: 1 } });
  console.log(`📊 Quizzes still limited: ${remaining}`);

  await mongoose.disconnect();
  console.log('🎉 Done!');
}

run().catch((err) => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});

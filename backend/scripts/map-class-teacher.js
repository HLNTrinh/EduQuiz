require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Class = require('../src/models/Class');
const User = require('../src/models/User');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/examdb';

(async () => {
  try {
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const classes = await Class.find({ $or: [{ teacher: null }, { teacher: { $exists: false } }], teacherName: { $exists: true, $ne: '' } }).lean();
    console.log(`Found ${classes.length} classes with teacherName but no teacher reference`);

    const report = { updated: [], ambiguous: [], unmatched: [] };

    for (const cls of classes) {
      const nameOrEmail = (cls.teacherName || '').trim();
      if (!nameOrEmail) continue;

      // First try exact email match
      let candidates = await User.find({ email: nameOrEmail.toLowerCase(), role: 'teacher' }).select('name email').lean();

      // If none, try exact name (case-insensitive)
      if (candidates.length === 0) {
        candidates = await User.find({ name: { $regex: `^${escapeRegex(nameOrEmail)}$`, $options: 'i' }, role: 'teacher' }).select('name email').lean();
      }

      // If still none, try partial match on name
      if (candidates.length === 0) {
        candidates = await User.find({ name: { $regex: escapeRegex(nameOrEmail), $options: 'i' }, role: 'teacher' }).select('name email').lean();
      }

      if (candidates.length === 1) {
        // update class
        await Class.updateOne({ _id: cls._id }, { $set: { teacher: candidates[0]._id, teacherName: candidates[0].name } });
        report.updated.push({ classId: cls._id, oldTeacherName: cls.teacherName, teacherId: candidates[0]._id, teacherName: candidates[0].name });
        console.log(`Updated class ${cls._id}: matched teacher ${candidates[0].name}`);
      } else if (candidates.length > 1) {
        report.ambiguous.push({ classId: cls._id, teacherName: cls.teacherName, candidates });
        console.log(`Ambiguous for class ${cls._id}: ${candidates.length} candidates`);
      } else {
        report.unmatched.push({ classId: cls._id, teacherName: cls.teacherName });
        console.log(`No match for class ${cls._id}: '${cls.teacherName}'`);
      }
    }

    const outPath = path.resolve(__dirname, 'map-class-teacher-report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log('Report written to', outPath);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
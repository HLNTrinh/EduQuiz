require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Question = require('../src/models/Question');
const Quiz = require('../src/models/Quiz');

function buildMongoUri() {
  const envUri = process.env.MONGO_URI;
  if (envUri) return envUri;
  return 'mongodb://admin:secret@localhost:27017/examdb?authSource=admin';
}

const mongoUri = buildMongoUri();

// 20 câu hỏi mẫu cho 4 môn
const sampleQuestions = [
  // TOÁN (5 câu)
  { category: 'Math', difficulty: 'medium', content: 'Đạo hàm của hàm số f(x) = x³ + 2x² - 5x + 1 là:', options: [{ text: "3x² + 4x - 5", isCorrect: true }, { text: "3x² + 4x + 5", isCorrect: false }, { text: "x² + 4x - 5", isCorrect: false }, { text: "3x² + 2x - 5", isCorrect: false }], explanation: 'f\'(x) = 3x² + 4x - 5' },
  { category: 'Math', difficulty: 'easy', content: 'Giá trị của ∫(2x + 1)dx từ 0 đến 2 là:', options: [{ text: "6", isCorrect: true }, { text: "4", isCorrect: false }, { text: "8", isCorrect: false }, { text: "10", isCorrect: false }], explanation: '∫(2x+1)dx = x² + x, thay cận 2 và 0 → (4+2)-0 = 6' },
  { category: 'Math', difficulty: 'hard', content: 'Số phức z thỏa mãn (1+i)z = 3+2i có phần thực là:', options: [{ text: "2.5", isCorrect: true }, { text: "1.5", isCorrect: false }, { text: "3.5", isCorrect: false }, { text: "0.5", isCorrect: false }], explanation: 'z = (3+2i)/(1+i) = ((3+2i)(1-i))/2 = (5-i)/2 → phần thực 2.5' },
  { category: 'Math', difficulty: 'medium', content: 'Tập nghiệm của bất phương trình x² - 5x + 6 < 0 là:', options: [{ text: "(2, 3)", isCorrect: true }, { text: "(-∞, 2) ∪ (3, +∞)", isCorrect: false }, { text: "[2, 3]", isCorrect: false }, { text: "(-∞, 2]", isCorrect: false }], explanation: 'x² - 5x + 6 = (x-2)(x-3) < 0 → 2 < x < 3' },
  { category: 'Math', difficulty: 'easy', content: 'log₂(16) bằng:', options: [{ text: "4", isCorrect: true }, { text: "2", isCorrect: false }, { text: "8", isCorrect: false }, { text: "16", isCorrect: false }], explanation: '2⁴ = 16 → log₂(16) = 4' },

  // VẬT LÝ (5 câu)
  { category: 'Physics', difficulty: 'medium', content: 'Một vật rơi tự do từ độ cao 80m. Thời gian rơi là (g = 10m/s²):', options: [{ text: "4s", isCorrect: true }, { text: "3s", isCorrect: false }, { text: "5s", isCorrect: false }, { text: "6s", isCorrect: false }], explanation: 'h = ½gt² → 80 = 5t² → t = 4s' },
  { category: 'Physics', difficulty: 'easy', content: 'Đơn vị của cường độ dòng điện là:', options: [{ text: "Ampe (A)", isCorrect: true }, { text: "Vôn (V)", isCorrect: false }, { text: "Ôm (Ω)", isCorrect: false }, { text: "Oát (W)", isCorrect: false }], explanation: 'Cường độ dòng điện đo bằng Ampe' },
  { category: 'Physics', difficulty: 'hard', content: 'Bước sóng ánh sáng đơn sắc có tần số 5×10¹⁴ Hz trong chân không là (c=3×10⁸ m/s):', options: [{ text: "600nm", isCorrect: true }, { text: "500nm", isCorrect: false }, { text: "700nm", isCorrect: false }, { text: "400nm", isCorrect: false }], explanation: 'λ = c/f = 3×10⁸/5×10¹⁴ = 6×10⁻⁷m = 600nm' },
  { category: 'Physics', difficulty: 'medium', content: 'Công thức tính lực đẩy Archimedes là:', options: [{ text: "F = d.V", isCorrect: true }, { text: "F = m.g", isCorrect: false }, { text: "F = k.Δl", isCorrect: false }, { text: "F = q.E", isCorrect: false }], explanation: 'Lực đẩy Archimedes: F = d.V (d là trọng lượng riêng, V là thể tích)' },
  { category: 'Physics', difficulty: 'easy', content: 'Khi nhiệt độ tăng, điện trở của kim loại:', options: [{ text: "Tăng", isCorrect: true }, { text: "Giảm", isCorrect: false }, { text: "Không đổi", isCorrect: false }, { text: "Tăng rồi giảm", isCorrect: false }], explanation: 'Điện trở kim loại tăng khi nhiệt độ tăng' },

  // TIẾNG ANH (5 câu)
  { category: 'English', difficulty: 'medium', content: 'Choose the correct sentence: "She ___ to school by bus every day."', options: [{ text: "goes", isCorrect: true }, { text: "go", isCorrect: false }, { text: "going", isCorrect: false }, { text: "went", isCorrect: false }], explanation: 'Chủ ngữ số ít (She) → động từ thêm "s/es"' },
  { category: 'English', difficulty: 'easy', content: 'What is the opposite of "hot"?', options: [{ text: "Cold", isCorrect: true }, { text: "Warm", isCorrect: false }, { text: "Cool", isCorrect: false }, { text: "Freezing", isCorrect: false }], explanation: 'Từ trái nghĩa với "hot" (nóng) là "cold" (lạnh)' },
  { category: 'English', difficulty: 'hard', content: 'Choose the correct preposition: "I\'m interested ___ learning Japanese."', options: [{ text: "in", isCorrect: true }, { text: "on", isCorrect: false }, { text: "at", isCorrect: false }, { text: "for", isCorrect: false }], explanation: '"interested in" là cụm từ cố định' },
  { category: 'English', difficulty: 'medium', content: '"I have been studying English for 5 years." This sentence is in the:', options: [{ text: "Present Perfect Continuous", isCorrect: true }, { text: "Present Simple", isCorrect: false }, { text: "Past Continuous", isCorrect: false }, { text: "Future Perfect", isCorrect: false }], explanation: '"have been + V-ing" → Present Perfect Continuous' },
  { category: 'English', difficulty: 'easy', content: 'Which word is a noun?', options: [{ text: "Happiness", isCorrect: true }, { text: "Happy", isCorrect: false }, { text: "Happily", isCorrect: false }, { text: "Happen", isCorrect: false }], explanation: '"Happiness" là danh từ (hạnh phúc)' },

  // HÓA HỌC (5 câu)
  { category: 'Chemistry', difficulty: 'medium', content: 'Công thức hóa học của axit sunfuric là:', options: [{ text: "H₂SO₄", isCorrect: true }, { text: "H₂SO₃", isCorrect: false }, { text: "H₂S", isCorrect: false }, { text: "HNO₃", isCorrect: false }], explanation: 'Axit sunfuric: H₂SO₄' },
  { category: 'Chemistry', difficulty: 'easy', content: 'Nguyên tố nào có ký hiệu là "Fe"?', options: [{ text: "Sắt", isCorrect: true }, { text: "Đồng", isCorrect: false }, { text: "Nhôm", isCorrect: false }, { text: "Kẽm", isCorrect: false }], explanation: 'Fe là ký hiệu của Sắt (Ferrum)' },
  { category: 'Chemistry', difficulty: 'hard', content: 'Phản ứng nào sau đây là phản ứng oxi hóa - khử?', options: [{ text: "Fe + CuSO₄ → FeSO₄ + Cu", isCorrect: true }, { text: "NaOH + HCl → NaCl + H₂O", isCorrect: false }, { text: "Na₂O + H₂O → 2NaOH", isCorrect: false }, { text: "CaCO₃ → CaO + CO₂", isCorrect: false }], explanation: 'Fe (0→+2) và Cu (+2→0) → có thay đổi số oxi hóa' },
  { category: 'Chemistry', difficulty: 'medium', content: 'pH của dung dịch HCl 0.001M là:', options: [{ text: "3", isCorrect: true }, { text: "1", isCorrect: false }, { text: "0.001", isCorrect: false }, { text: "11", isCorrect: false }], explanation: '[H⁺] = 0.001 = 10⁻³ → pH = 3' },
  { category: 'Chemistry', difficulty: 'easy', content: 'Nước có công thức hóa học là:', options: [{ text: "H₂O", isCorrect: true }, { text: "H₂O₂", isCorrect: false }, { text: "HO", isCorrect: false }, { text: "H₂O₃", isCorrect: false }], explanation: 'Nước có công thức H₂O' },
];

// 4 đề thi mẫu
const sampleQuizzes = [
  {
    title: 'Ôn tập Giải tích 12 - Chương 1',
    description: 'Đề thi trắc nghiệm ôn tập các kiến thức về đạo hàm và nguyên hàm, giới hạn.',
    duration: 30,
    totalPoints: 100,
    passingScore: 40,
    subject: 'Math',
    subjectLabel: 'Toán học',
  },
  {
    title: 'Kiểm tra Vật lý - Dao động cơ học',
    description: 'Đề kiểm tra kiến thức về dao động điều hòa, con lắc lò xo và con lắc đơn.',
    duration: 25,
    totalPoints: 100,
    passingScore: 40,
    subject: 'Physics',
    subjectLabel: 'Vật lý',
  },
  {
    title: 'English Grammar & Vocabulary Test',
    description: 'Test your knowledge of English grammar, vocabulary, and sentence structure.',
    duration: 20,
    totalPoints: 100,
    passingScore: 50,
    subject: 'English',
    subjectLabel: 'Tiếng Anh',
  },
  {
    title: 'Hóa học - Axit, Bazơ và Muối',
    description: 'Ôn tập kiến thức về axit, bazơ, muối và phản ứng hóa học vô cơ.',
    duration: 20,
    totalPoints: 100,
    passingScore: 40,
    subject: 'Chemistry',
    subjectLabel: 'Hóa học',
  },
];

async function run() {
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  // 1. Tìm hoặc tạo teacher
  let teacher = await User.findOne({ email: 'teacher@eduquiz.vn' });
  if (!teacher) {
    const hashed = await bcrypt.hash('teacher123', 10);
    teacher = await User.create({
      name: 'Nguyễn Văn Giáo Viên',
      email: 'teacher@eduquiz.vn',
      password: hashed,
      phone: '091 234 5678',
      role: 'teacher',
      avatar: 'https://i.pravatar.cc/200?img=60',
    });
    console.log('✅ Created teacher account: teacher@eduquiz.vn / teacher123');
  } else {
    console.log('✅ Teacher already exists: teacher@eduquiz.vn');
  }

  // 2. Tìm hoặc tạo student
  let student = await User.findOne({ email: 'student@eduquiz.vn' });
  if (!student) {
    const hashed = await bcrypt.hash('student123', 10);
    student = await User.create({
      name: 'Trần Thị Học Sinh',
      email: 'student@eduquiz.vn',
      password: hashed,
      phone: '098 765 4321',
      role: 'student',
      avatar: 'https://i.pravatar.cc/200?img=33',
    });
    console.log('✅ Created student account: student@eduquiz.vn / student123');
  } else {
    console.log('✅ Student already exists: student@eduquiz.vn');
  }

  // 3. Xóa câu hỏi cũ và tạo mới
  await Question.deleteMany({ createdBy: teacher._id });
  const createdQuestions = [];
  for (const q of sampleQuestions) {
    const question = await Question.create({
      ...q,
      createdBy: teacher._id,
    });
    createdQuestions.push(question);
  }
  console.log(`✅ Created ${createdQuestions.length} sample questions`);

  // 4. Xóa quiz cũ và tạo mới (đã publish)
  await Quiz.deleteMany({ createdBy: teacher._id });

  // Phân bổ câu hỏi cho từng đề
  const subjectMap = {
    Math: createdQuestions.filter(q => q.category === 'Math').map(q => q._id),
    Physics: createdQuestions.filter(q => q.category === 'Physics').map(q => q._id),
    English: createdQuestions.filter(q => q.category === 'English').map(q => q._id),
    Chemistry: createdQuestions.filter(q => q.category === 'Chemistry').map(q => q._id),
  };

  for (const quizDef of sampleQuizzes) {
    const questionIds = subjectMap[quizDef.subject] || [];
    const quiz = await Quiz.create({
      title: quizDef.title,
      description: quizDef.description,
      duration: quizDef.duration,
      totalPoints: quizDef.totalPoints,
      passingScore: quizDef.passingScore,
      maxAttempts: 3,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 ngày sau
      showAnswerAfter: true,
      isPublished: true,
      createdBy: teacher._id,
      questions: questionIds.map((qId, index) => ({
        questionId: qId,
        order: index + 1,
      })),
    });
    console.log(`✅ Created quiz: "${quiz.title}" (${questionIds.length} questions)`);
  }

  console.log('\n🎉 Done! You can now login with:');
  console.log('   Student: student@eduquiz.vn / student123');
  console.log('   Teacher: teacher@eduquiz.vn / teacher123');
  console.log('   Admin:   admin@eduquiz.vn / admin123 (if created)');
  console.log('\n📝 Go to /student/exams to take the quizzes!');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});


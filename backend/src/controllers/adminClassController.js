const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const multer = require('multer');
const { Readable } = require('stream');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Utility: escape regex for exact name matching
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* =========================
   GET /api/admin/classes
   Lấy danh sách lớp học (có tìm kiếm, phân trang)
========================= */
const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [classes, total] = await Promise.all([
      Class.find(filter)
        .populate('teacher', 'name email avatar')
        .populate('students', 'name email avatar role status userCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Class.countDocuments(filter),
    ]);

    // Cách 1: Tính lại studentCount dựa trên danh sách học sinh THỰC SỰ còn tồn tại sau khi populate
    // (populate sẽ tự động bỏ qua các ObjectId đã bị xóa khỏi User collection)
    const classesWithCorrectCount = classes.map((c) => ({
      ...c,
      studentCount: c.students.length,
    }));

    res.json({ success: true, classes: classesWithCorrectCount, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/classes/:id
========================= */
const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status userCode')
      .lean();

    if (!classItem) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    // Cách 1: Tính lại studentCount dựa trên danh sách học sinh THỰC SỰ còn tồn tại sau khi populate
    classItem.studentCount = classItem.students.length;
    res.json({ success: true, class: classItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/classes
   Tạo lớp học mới
========================= */
const createClass = async (req, res) => {
  try {
    const { name, teacher, teacherName, year, status } = req.body;

    // Resolve teacher: prefer explicit teacher ObjectId; otherwise try to match by name or email
    let teacherId = null;
    let resolvedTeacherName = teacherName || '';

    if (teacher && mongoose.Types.ObjectId.isValid(teacher)) {
      teacherId = teacher;
      // try to get canonical name
      const t = await User.findById(teacherId).select('name');
      if (t) resolvedTeacherName = t.name;
    } else if (teacherName) {
      // try exact email match or exact name (case-insensitive)
      const found = await User.findOne({
        $or: [
          { email: teacherName.toLowerCase() },
          { name: { $regex: `^${escapeRegex(teacherName)}$`, $options: 'i' } },
        ],
        role: 'teacher',
      }).select('name');

      if (found) {
        teacherId = found._id;
        resolvedTeacherName = found.name;
      }
    }

    const classData = {
      name,
      teacher: teacherId,
      teacherName: resolvedTeacherName,
      year: year || '',
      status: status || 'active',
      students: [],
      studentCount: 0,
    };

    const newClass = await Class.create(classData);

    res.status(201).json({ success: true, message: 'Tạo lớp học thành công', class: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/classes/:id
   Cập nhật thông tin lớp học
========================= */
const updateClass = async (req, res) => {
  try {
    const { name, teacher, teacherName, year, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;

    // If teacher explicitly provided (could be null to clear), use it
    if (teacher !== undefined) {
      updateData.teacher = teacher;
    }

    // If teacherName provided but teacher not explicitly set, try to resolve to teacher id
    if ((teacher === undefined || teacher === null) && teacherName) {
      const found = await User.findOne({
        $or: [
          { email: teacherName.toLowerCase() },
          { name: { $regex: `^${escapeRegex(teacherName)}$`, $options: 'i' } },
        ],
        role: 'teacher',
      }).select('name');

      if (found) {
        updateData.teacher = found._id;
        updateData.teacherName = found.name;
      } else {
        // If not found, still update teacherName field so admin can store free text
        updateData.teacherName = teacherName;
      }
    } else if (teacherName !== undefined) {
      updateData.teacherName = teacherName;
    }

    if (year) updateData.year = year;
    if (status) updateData.status = status;

    const updatedClass = await Class.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status userCode');

    if (!updatedClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });

    res.json({ success: true, message: 'Cập nhật lớp học thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/classes/:id
   Xóa lớp học
========================= */
const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByIdAndDelete(req.params.id);
    if (!classItem) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    res.json({ success: true, message: 'Xóa lớp học thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/classes/:id/students
   Thêm học sinh vào lớp
========================= */
const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID học sinh' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'ID học sinh không hợp lệ' });
    }

    // Kiểm tra user có tồn tại không
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Tài khoản được chọn không phải học sinh' });
    }

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    // Kiểm tra học sinh đã có trong lớp chưa
    if (classItem.students.some((id) => id.equals(student._id))) {
      return res.status(400).json({ success: false, message: 'Học sinh đã có trong lớp này' });
    }

    classItem.students.push(studentId);
    classItem.studentCount = classItem.students.length;
    await classItem.save();

    const updatedClass = await Class.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status userCode')
      .lean();

    res.json({ success: true, message: 'Thêm học sinh thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/classes/:id/import-students
   Import danh sách học sinh từ file CSV/Excel, tự động tạo user và gắn vào lớp
   Chiến lược A: bỏ qua email trùng (trong file hoặc với DB) và báo cáo
========================= */
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload file CSV hoặc Excel' });
    }

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    // Đọc file bằng exceljs (hỗ trợ cả .csv, .xlsx, .xls)
    const workbook = new ExcelJS.Workbook();
    const originalName = (req.file.originalname || '').toLowerCase();
    let worksheet;

    if (originalName.endsWith('.csv')) {
      // File CSV: dùng csv.read với stream (ổn định hơn buffer)
      const stream = Readable.from(req.file.buffer);
      await workbook.csv.read(stream, { parserOptions: { delimiter: ',' } });
      worksheet = workbook.worksheets[0];
    } else {
      // File Excel (.xlsx, .xls): dùng xlsx.load
      await workbook.xlsx.load(req.file.buffer);
      worksheet = workbook.worksheets[0];
    }

    if (!worksheet) {
      return res.status(400).json({ success: false, message: 'File không có dữ liệu' });
    }

    // Đọc tất cả dòng thành mảng
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // bỏ qua header
      const values = row.values;
      // values[1] = Mã số học sinh, values[2] = Họ tên, values[3] = Email, values[4] = SĐT, values[5] = Mật khẩu
      const userCode = (values[1] || '').toString().trim();
      const name = (values[2] || '').toString().trim();
      const email = (values[3] || '').toString().trim().toLowerCase();
      const phone = (values[4] || '').toString().trim();
      const password = (values[5] || '').toString().trim();
      if (name && email) {
        rows.push({ userCode, name, email, phone, password });
      }
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File không có dòng dữ liệu hợp lệ (cần Họ tên và Email)' });
    }

    // Bước 1: Loại bỏ email trùng trong file (giữ dòng đầu tiên)
    const seenEmails = new Set();
    const uniqueRows = [];
    const duplicateInFile = [];
    rows.forEach((row) => {
      if (seenEmails.has(row.email)) {
        duplicateInFile.push(row.email);
      } else {
        seenEmails.add(row.email);
        uniqueRows.push(row);
      }
    });

    // Bước 2: Tìm email đã tồn tại trong DB (lấy cả _id để gắn vào lớp)
    const emails = uniqueRows.map((r) => r.email);
    const existingUsers = await User.find({ email: { $in: emails } }).select('email userCode').lean();
    const existingByEmail = new Map(existingUsers.map((u) => [u.email, u._id]));

    // Kiểm tra userCode trùng (trong file và với DB)
    const userCodesInFile = uniqueRows.filter(r => r.userCode).map(r => r.userCode);
    const existingCodes = userCodesInFile.length > 0
      ? await User.find({ userCode: { $in: userCodesInFile } }).select('userCode').lean()
      : [];
    const existingCodesSet = new Set(existingCodes.map(u => u.userCode));
    const seenCodesInFile = new Set();
    const duplicateCodesInFile = [];
    uniqueRows.forEach((row) => {
      if (row.userCode) {
        if (seenCodesInFile.has(row.userCode) || existingCodesSet.has(row.userCode)) {
          duplicateCodesInFile.push(row.userCode);
        }
        seenCodesInFile.add(row.userCode);
      }
    });
    if (duplicateCodesInFile.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Mã số học sinh trùng (trong file hoặc đã tồn tại): ${[...new Set(duplicateCodesInFile)].join(', ')}`,
      });
    }

    // Bước 3: Tách dòng
    // - toCreate: email chưa tồn tại → tạo tài khoản mới
    // - toAddToClass: email đã tồn tại → không tạo mới, chỉ gắn vào lớp
    const toCreate = [];
    const toAddToClass = [];
    uniqueRows.forEach((row) => {
      if (existingByEmail.has(row.email)) {
        toAddToClass.push({ row, userId: existingByEmail.get(row.email) });
      } else {
        toCreate.push(row);
      }
    });

    // Bước 4: Băm mật khẩu và tạo user mới
    const createdUsers = [];
    const errors = [];
    const defaultPassword = 'EduQuiz@123';

    for (const row of toCreate) {
      try {
        const hashedPassword = await bcrypt.hash(row.password || defaultPassword, 12);
        const user = await User.create({
          name: row.name,
          userCode: row.userCode || null,
          email: row.email,
          password: hashedPassword,
          role: 'student',
          status: 'active',
          phone: row.phone || null,
          joinDate: new Date(),
          avatar: null,              // Avatar mặc định do frontend tạo (màu + chữ đầu/cuối)
        });
        createdUsers.push(user._id);
      } catch (err) {
        // Nếu lỗi unique (email trùng do race condition) thì gắn vào lớp thay vì tạo mới
        if (err.code === 11000) {
          const dup = await User.findOne({ email: row.email }).select('_id').lean();
          if (dup) toAddToClass.push({ row, userId: dup._id });
        } else {
          errors.push(`Lỗi tạo user ${row.email}: ${err.message}`);
        }
      }
    }

    // Bước 5: Gắn user (mới + đã tồn tại) vào lớp, tránh trùng trong lớp
    const studentsToAdd = [...createdUsers, ...toAddToClass.map((item) => item.userId)];
    const addedToClass = [];
    const alreadyInClass = [];
    if (studentsToAdd.length > 0) {
      const currentIds = new Set(classItem.students.map((id) => id.toString()));
      studentsToAdd.forEach((id) => {
        const idStr = id.toString();
        if (currentIds.has(idStr)) {
          alreadyInClass.push(idStr);
        } else {
          classItem.students.push(id);
          currentIds.add(idStr);
          addedToClass.push(idStr);
        }
      });
      classItem.studentCount = classItem.students.length;
      await classItem.save();
    }

    // Bước 6: Trả về báo cáo
    const skipped = duplicateInFile.length + alreadyInClass.length;
    res.json({
      success: true,
      message: `Import thành công ${createdUsers.length} học sinh mới, thêm ${addedToClass.length} học sinh vào lớp`,
      created: createdUsers.length,
      addedToClass: addedToClass.length,
      skipped,
      duplicateInFile,
      alreadyInClass,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/classes/:id/students/:studentId
   Xóa học sinh khỏi lớp
========================= */
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    const studentIndex = classItem.students.findIndex((student) => student.equals(studentId));
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Học sinh không có trong lớp này' });
    }

    classItem.students.splice(studentIndex, 1);
    classItem.studentCount = classItem.students.length;
    await classItem.save();

    const updatedClass = await Class.findById(id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status userCode')
      .lean();

    res.json({ success: true, message: 'Xóa học sinh khỏi lớp thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  importStudents,
  upload,
};

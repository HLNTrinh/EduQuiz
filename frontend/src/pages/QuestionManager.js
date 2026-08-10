import React, { useEffect, useMemo, useState } from 'react';

import { FiAlertTriangle, FiCheckCircle, FiXCircle,} from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { RiDeleteBin3Line } from "react-icons/ri";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionService, subjectService } from '../services/authService';
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import Papa from "papaparse";
import { RxCross2 } from "react-icons/rx";
import '../styles/QuestionsBank.css';


const emptyForm = {
  content: '',
  category: '',
  difficulty: 'medium',
  explanation: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
};
const createEmptyQuestion = (category = '') => ({
  content: '',
  category,
  difficulty: 'medium',
  explanation: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

const normalizeQuestionContent = (content) =>
  String(content || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();

const getQuestionCategoryKey = (category) =>
  typeof category === 'object' ? category?._id : category;

export const QuestionManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('Mới nhất');
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
 // Danh sách các câu hỏi đang nhập trong form "Thêm câu hỏi mới"
  const [questionForms, setQuestionForms] = useState([]);
  //Thêm state cho CSV
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [message, setMessage] = useState('');
  const [toast, setToast] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const showToast = (text, type = "success") => {
    setToast({
      show: true,
      text,
      type,
    });

    setTimeout(() => {
      setToast(prev => ({
        ...prev,
        show: false,
      }));
    }, 3500);
  };

  const [subjectList, setSubjectList] = useState([]);
  const [subjects, setSubjects] = useState([]);

  /* phân trang ngân hàng câu hỏi */
  const QUESTIONS_PER_PAGE = 50;
  const [questionPage, setQuestionPage] = useState(1); 

  const tabs = useMemo(() => {
    return ['Tất cả', ...subjectList.map((s) => s._id)];
  }, [subjectList]);

  const loadSubjects = async () => {
    try {
      // getCategories trả về các môn giáo viên được phân công dạy
      const res = await questionService.getCategories();
      const list = Array.isArray(res) ? res : [];
      setSubjectList(list);
    } catch (error) {
      // silent
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const items = await questionService.getAllQuestions();
      setQuestions(Array.isArray(items) ? items : []);
    } catch (error) {
     //setMessage(error.message || 'Không thể tải câu hỏi.');
      showToast(error.message || 'Không thể tải câu hỏi.', 'error');
    } finally {
      setLoading(false);
    }
  };
/*Gọi API lấy danh sách môn học -> Lưu vào state subjects, state ở <select>*/
  const loadCategories = async () => {
    try {
      const response = await questionService.getCategories();

      const categories = Array.isArray(response)
        ? response
        : [];

      setSubjects([
        "Tất cả",
        ...categories
      ]);

    } catch (error) {
      console.log("Lỗi lấy môn học:", error);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadQuestions();
    loadCategories();
  }, []);
  /* Khi searchQuery thay đổi, reset questionPage về 1 */
  useEffect(() => {
    setQuestionPage(1);
  }, [searchQuery]);

  const getSubjectName = (id) => {
    const found = subjectList.find((s) => s._id === id);
    return found ? found.name : id || 'Khác';
  };

  const filteredQuestions = useMemo(() => {
    return questions
      .filter((item) => {
        const title = item.content || '';
        const subject = item.category || '';
        const difficultyValue = item.difficulty || '';
        return (
          (selectedSubject === 'Tất cả' || subject === selectedSubject) &&
          (difficulty === 'Tất cả' || difficultyValue === (difficulty === 'Dễ' ? 'easy' : difficulty === 'Khó' ? 'hard' : 'medium')) &&
          (title.toLowerCase().includes(searchQuery.toLowerCase()) || (item._id || '').toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
      if (sortOrder === 'Mới nhất') {
          return bTime - aTime;
        }
        return aTime - bTime;
      });
  }, [questions, searchQuery, selectedSubject, difficulty, sortOrder]);

  const duplicateQuestionKeys = useMemo(() => {
    const counts = new Map();

    questions.forEach((question) => {
      const content = normalizeQuestionContent(question.content);
      if (!content) return;
      const key = `${getQuestionCategoryKey(question.category) || ''}:${content}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key)
    );
  }, [questions]);

  const getQuestionDuplicateKey = (question, content = question.content, category = question.category) =>
    `${getQuestionCategoryKey(category) || ''}:${normalizeQuestionContent(content)}`;

  const totalQuestionPages = Math.ceil(
  filteredQuestions.length / QUESTIONS_PER_PAGE
);
  /* Lấy danh sách câu hỏi theo trang hiện tại */
  const paginatedQuestions = useMemo(() => {
    const start = (questionPage - 1) * QUESTIONS_PER_PAGE;
    return filteredQuestions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [filteredQuestions, questionPage]);

  const handleOpenForm = (question = null) => {
    // Nếu mở chế độ chỉnh sửa
    if (question) {
      setShowForm(false);

      setFormData({
        ...question,
        explanation: question.explanation || '',
        options:
          question.options?.map((option) => ({
            text: option.text || '',
            isCorrect: Boolean(option.isCorrect),
          })) || createEmptyQuestion().options,
      });

      setToast((prev) => ({ ...prev, show: false }));
      setShowEditModal(true);
      return;
    }

    // Nếu mở form thêm mới
    const defaultCategory =
      subjectList.length > 0 ? subjectList[0]._id : '';

    setQuestionForms([
      createEmptyQuestion(defaultCategory)
    ]);

    setFormData(createEmptyQuestion(defaultCategory));

    setShowEditModal(false);
    setToast((prev) => ({ ...prev, show: false }));
    setShowForm(true);
  };

  const handleOpenEditModal = (question) => {
    setShowForm(false);
    setFormData({
      ...question,
      explanation: question.explanation || '',
      options: question.options?.map((option) => ({
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect),
      })) || emptyForm.options,
    });

    //setMessage('');
    setToast(prev => ({ ...prev, show: false }));
    setShowEditModal(true);
  };
  const handleOptionChange = (index, field, value) => {
    const nextOptions = [...formData.options];
    nextOptions[index] = { ...nextOptions[index], [field]: value };
    setFormData({ ...formData, options: nextOptions });
  };

// Thay đổi nội dung / môn học / độ khó / giải thích
const handleQuestionChange = (questionIndex, field, value) => {
  setQuestionForms((prev) =>
    prev.map((question, index) =>
      index === questionIndex
        ? {
            ...question,
            [field]: value,
          }
        : question
    )
  );
};

{/**/}
  // Thay đổi nội dung đáp án A/B/C/D
  const handleQuestionOptionChange = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestionForms((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;

        const options = [...question.options];

        options[optionIndex] = {
          ...options[optionIndex],
          text: value,
        };

        return {
          ...question,
          options,
        };
      })
    );
  };


  // Chọn đáp án đúng
  const handleQuestionCorrectChange = (
    questionIndex,
    optionIndex
  ) => {
    setQuestionForms((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, idx) => ({
            ...option,
            isCorrect: idx === optionIndex,
          })),
        };
      })
    );
  };


  // Thêm câu hỏi tiếp theo
  const handleAddNextQuestion = () => {
    const defaultCategory =
      subjectList.length > 0 ? subjectList[0]._id : '';

    setQuestionForms((prev) => [
      ...prev,
      createEmptyQuestion(defaultCategory),
    ]);
  };


  // Xóa một câu hỏi khỏi form
  const handleRemoveQuestionForm = (questionIndex) => {
    setQuestionForms((prev) =>
      prev.filter((_, index) => index !== questionIndex)
    );
  };  

  const handleSubmit = async (event) => {
    event.preventDefault();

    const content = (formData.content || '').trim();
    const options = (formData.options || []).map((option) => ({ text: (option.text || '').trim(), isCorrect: Boolean(option.isCorrect) }));
    const correctCount = options.filter((option) => option.isCorrect).length;

    if (!content) {
      //setMessage('Vui lòng nhập nội dung câu hỏi.');
      showToast('Vui lòng nhập nội dung câu hỏi.', 'error');
      return;
    }

    if (options.length !== 4 || options.some((option) => !option.text)) {
      //setMessage('Vui lòng nhập đủ 4 đáp án.' );
      showToast('Vui lòng nhập đủ 4 đáp án.', 'error');
      return;
    }

    if (correctCount !== 1) {
      //setMessage('Vui lòng chọn đúng một đáp án.');
      showToast('Vui lòng chọn đúng một đáp án.', 'error)');
      return;
    }

    const duplicate = questions.find((question) =>
      question._id !== formData._id &&
      getQuestionDuplicateKey(question, content, formData.category) ===
        getQuestionDuplicateKey(formData, content, formData.category)
    );
    if (duplicate) {
      showToast('Cảnh báo: câu hỏi này đã tồn tại trong môn học.', 'warning');
      return;
    }

    try {
      const payload = {
        content,
        options,
        category: formData.category,
        difficulty: formData.difficulty,
        explanation: (formData.explanation || '').trim(),
      };

      const response = formData._id
        ? await questionService.updateQuestion(formData._id, payload)
        : await questionService.createQuestion(payload);
      const savedQuestion = response?.data || response;
      setQuestions((prev) => {
        if (formData._id) {
          return prev.map((item) => (item._id === formData._id ? savedQuestion : item));
        }
        return [savedQuestion, ...prev];
      });

      if (formData._id) {
        setShowEditModal(false);
      } else {
        setShowForm(false);
      }

      setFormData({
        ...emptyForm,
        category: subjects.length > 1 ? subjects[1] : '',
      });
      //setMessage(formData._id ? 'Đã cập nhật câu hỏi thành công.' : 'Đã thêm câu hỏi mới thành công.');
      showToast(formData._id ? 'Đã cập nhật câu hỏi thành công.' : 'Đã thêm câu hỏi mới thành công.', 'success');

    } catch (error) {
      //setMessage(error.message || 'Không thể lưu câu hỏi.');
      showToast(error.message || 'Không thể lưu câu hỏi.', 'error');
    }
  };
  /*hàm lưu nhiều câu hỏi*/
  const handleSubmitQuestions = async (event) => {
    event.preventDefault();

    if (questionForms.length === 0) {
      showToast('Vui lòng thêm ít nhất một câu hỏi.', 'error');
      return;
    }

    // Kiểm tra tất cả câu hỏi trước khi gửi API
    for (let i = 0; i < questionForms.length; i++) {
      const question = questionForms[i];

      const content = (question.content || '').trim();

      const options = question.options.map((option) => ({
        text: (option.text || '').trim(),
        isCorrect: Boolean(option.isCorrect),
      }));

      const correctCount = options.filter(
        (option) => option.isCorrect
      ).length;

      if (!content) {
        showToast(
          `Vui lòng nhập nội dung Câu hỏi số ${i + 1}.`,
          'error'
        );
        return;
      }

      if (
        options.length !== 4 ||
        options.some((option) => !option.text)
      ) {
        showToast(
          `Vui lòng nhập đủ 4 đáp án cho Câu hỏi số ${i + 1}.`,
          'error'
        );
        return;
      }

      if (correctCount !== 1) {
        showToast(
          `Vui lòng chọn đúng một đáp án cho Câu hỏi số ${i + 1}.`,
          'error'
        );
        return;
      }

      if (!question.category) {
        showToast(
          `Vui lòng chọn môn học cho Câu hỏi số ${i + 1}.`,
          'error'
        );
        return;
      }

      const duplicateInForm = questionForms.some((otherQuestion, otherIndex) =>
        otherIndex !== i &&
        getQuestionDuplicateKey(otherQuestion, otherQuestion.content, otherQuestion.category) ===
          getQuestionDuplicateKey(question, content, question.category)
      );
      const duplicateInBank = questions.some((existingQuestion) =>
        getQuestionDuplicateKey(existingQuestion, content, question.category) ===
          getQuestionDuplicateKey(question, content, question.category)
      );
      if (duplicateInForm || duplicateInBank) {
        showToast(`Cảnh báo: Câu hỏi số ${i + 1} đã trùng trong ngân hàng hoặc danh sách đang nhập.`, 'warning');
        return;
      }
    }

    try {
      const savedQuestions = [];

      // Lưu lần lượt từng câu hỏi
      for (const question of questionForms) {
        const payload = {
          content: question.content.trim(),

          options: question.options.map((option) => ({
            text: option.text.trim(),
            isCorrect: Boolean(option.isCorrect),
          })),

          category: question.category,

          difficulty: question.difficulty,

          explanation: (question.explanation || '').trim(),
        };

        const response =
          await questionService.createQuestion(payload);

        const savedQuestion =
          response?.data || response;

        savedQuestions.push(savedQuestion);
      }

      // Thêm toàn bộ câu hỏi mới vào danh sách
      setQuestions((prev) => [
        ...savedQuestions,
        ...prev,
      ]);

      showToast(
        `Đã lưu ${savedQuestions.length} câu hỏi thành công.`,
        'success'
      );

      // Reset form về câu hỏi số 1
      const defaultCategory =
        subjectList.length > 0
          ? subjectList[0]._id
          : '';

      setQuestionForms([
        createEmptyQuestion(defaultCategory),
      ]);

    } catch (error) {
      showToast(
        error.message || 'Không thể lưu câu hỏi.',
        'error'
      );
    }
  };


  const handleDelete = async (questionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await questionService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
      //setMessage('Đã xóa câu hỏi thành công.');
      showToast('Đã xóa câu hỏi thành công.', 'success');
    } catch (error) {
      //setMessage(error.message || 'Không thể xóa câu hỏi.');
      showToast(error.message || 'Không thể xóa câu hỏi.', 'error');
    }
  };

//Thêm input file ẩn
  const handleCSVButtonClick = () => {
    document.getElementById('question-csv-input')?.click();
  };

  // ==========================================
  // TẢI FILE CSV MẪU
  // ==========================================
  const handleDownloadTemplate = () => {
    const headers = [
      'content',
      'category',
      'difficulty',
      'optionA',
      'optionB',
      'optionC',
      'optionD',
      'correctAnswer',
      'explanation',
    ];

    const sampleRows = [
      [
        'Thủ đô của Việt Nam là gì?',
        'Toán',
        'medium',
        'Hà Nội',
        'TP.HCM',
        'Đà Nẵng',
        'Hải Phòng',
        'A',
        'Đây là một câu hỏi ví dụ.',
      ],
    ];

    // BOM để Excel đọc đúng tiếng Việt
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cau_hoi_mau.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      'Đã tải file CSV mẫu. Vui lòng giữ đúng tên cột như trong file mẫu.',
      'success'
    );
  };

  // ==========================================
  // CHUYỂN ĐỔI ENCODING (FileReader + TextDecoder)
  // ==========================================
  const decodeFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () =>
        reject(new Error('Không thể đọc file CSV.'));

      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const bytes = new Uint8Array(buffer);

          let text = '';

          // Kiểm tra BOM UTF-8: EF BB BF
          if (
            bytes[0] === 0xef &&
            bytes[1] === 0xbb &&
            bytes[2] === 0xbf
          ) {
            text = new TextDecoder('utf-8').decode(
              bytes.subarray(3)
            );
          }
          // Kiểm tra BOM UTF-16 LE: FF FE
          else if (
            bytes[0] === 0xff &&
            bytes[1] === 0xfe
          ) {
            text = new TextDecoder('utf-16le').decode(
              bytes.subarray(2)
            );
          }
          // Kiểm tra BOM UTF-16 BE: FE FF
          else if (
            bytes[0] === 0xfe &&
            bytes[1] === 0xff
          ) {
            text = new TextDecoder('utf-16be').decode(
              bytes.subarray(2)
            );
          }
          // Không có BOM -> thử UTF-8, nếu lỗi thì thử Windows-1258/1252
          else {
            try {
              text = new TextDecoder('utf-8', {
                fatal: true,
              }).decode(bytes);
            } catch (e) {
              // UTF-8 lỗi -> nhiều khả năng là ANSI (Windows-1258 cho tiếng Việt)
              text = decodeWindows1258(bytes);
            }
          }

          resolve(text);
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Giải mã mã Windows-1258 (ANSI tiếng Việt) sang Unicode
  const decodeWindows1258 = (bytes) => {
    const bytes1 = Array.from(bytes);

    return bytes1
      .map((byte) => {
        // Bản đồ các ký tự tiếng Việt đặc biệt trong Windows-1258
        const map = {
          0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„',
          0x85: '…', 0x86: '†', 0x87: '‡', 0x88: 'ˆ',
          0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ',
          0x8e: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“',
          0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
          0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›',
          0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
          0xa0: '\u00a0', 0xa1: '¡', 0xa2: '¢', 0xa3: '£',
          0xa4: '¤', 0xa5: '¥', 0xa6: '¦', 0xa7: '§',
          0xa8: '¨', 0xa9: '©', 0xaa: 'ª', 0xab: '«',
          0xac: '¬', 0xad: '\u00ad', 0xae: '®', 0xaf: '¯',
          0xb0: '°', 0xb1: '±', 0xb2: '²', 0xb3: '³',
          0xb4: '´', 0xb5: 'µ', 0xb6: '¶', 0xb7: '·',
          0xb8: '¸', 0xb9: '¹', 0xba: 'º', 0xbb: '»',
          0xbc: '¼', 0xbd: '½', 0xbe: '¾', 0xbf: '¿',
          // Các ký tự tiếng Việt Windows-1258
          0xd0: 'Đ', 0xd1: 'đ', 0xd2: 'Ỳ', 0xd3: 'Ý',
          0xd4: 'Ỵ', 0xd5: 'Ỷ', 0xd6: 'Ỹ', 0xd7: '×',
          0xf0: 'ð', 0xf1: 'ð', 0xf2: 'ò', 0xf3: 'ó',
          0xf4: 'ô', 0xf5: 'õ', 0xf6: 'ö', 0xf7: '÷',
          0xf8: 'ø', 0xf9: 'ù', 0xfa: 'ú', 0xfb: 'û',
          0xfc: 'ü', 0xfd: 'ý', 0xfe: 'þ', 0xff: 'ÿ',
        };

        // Nếu byte < 128 => giữ nguyên ký tự ASCII
        if (byte < 128) return String.fromCharCode(byte);

        // Nếu có trong bản đồ đặc biệt
        if (byte in map) return map[byte];

        // Fallback: dùng Latin-1
        return String.fromCharCode(byte);
      })
      .join('');
  };

  const handleCSVImport = (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
          showToast('Vui lòng chọn file CSV.', 'error');
          event.target.value = '';
          return;
      }

      setCsvFileName(file.name);
      setIsImportingCSV(true);

      // Đọc file và tự nhận diện encoding trước khi parse
      decodeFile(file)
        .then((text) => {
          Papa.parse(text, {
            header: true,
skipEmptyLines: true,
            encoding: 'UTF-8',
            delimiter: '', // để PapaParse tự dò dấu phân cách (`,` hoặc `;`)
            transformHeader: (header) =>
              String(header || '')
                .replace(/^\uFEFF/, '')
                .trim(),

            complete: async (results) => {
              try {
                  if (
                    results.errors &&
                    results.errors.length > 0 &&
                    results.errors.some(
                      (err) => err.type === 'Delimiter'
                    )
                  ) {
                      console.error('CSV errors:', results.errors);

                      showToast(
                          'File CSV có lỗi định dạng (sai dấu phân cách).',
                          'error'
                      );

                      return;
                  }

                  const rows = results.data || [];

                  if (rows.length === 0) {
                      showToast(
                          'File CSV không có dữ liệu. Vui lòng kiểm tra lại file (cần có dòng tiêu đề đúng chuẩn và ít nhất 1 dòng dữ liệu).',
                          'error'
                      );

                      return;
                  }

                  // Kiểm tra các cột bắt buộc
                  const missingColumns = [
                    'content',
                    'optionA',
                    'optionB',
                    'optionC',
                    'optionD',
                    'correctAnswer',
                  ].filter((col) => {
                    const hasColumn = rows.some(
                      (r) =>
                        Object.prototype.hasOwnProperty.call(r, col) &&
                        r[col] !== undefined
                    );
                    return !hasColumn;
                  });

                  if (missingColumns.length > 0) {
                      showToast(
                          `File CSV thiếu cột bắt buộc: ${missingColumns.join(
                            ', '
                          )}. Vui lòng tải file mẫu để xem đúng định dạng.`,
                          'error'
                      );

                      return;
                  }

                  console.log('CSV:', rows);

                  // ==========================================
                  // CHUYỂN CSV → QUESTION
                  // ==========================================

                  const importedQuestions = [];

                  // ==== CHẶN TRÙNG KHI IMPORT CSV ====
                  // Tập hợp nội dung câu hỏi đã có trong ngân hàng (theo content)
                  const existingContents = new Set(
                    (Array.isArray(questions) ? questions : [])
                      .map((q) => String(q.content || '').trim().toLowerCase())
                      .filter(Boolean)
                  );
                  const seenContents = new Set();
                  let skippedDuplicateCount = 0;

                  for (let i = 0; i < rows.length; i++) {

                      const row = rows[i];

                      const content =
                          String(row.content || '').trim();

                      const categoryName =
                          String(row.category || '').trim();

                      const difficulty =
                          String(row.difficulty || '')
                              .trim()
                              .toLowerCase();

                      const optionA =
                          String(row.optionA || '').trim();

                      const optionB =
                          String(row.optionB || '').trim();

                      const optionC =
                          String(row.optionC || '').trim();

                      const optionD =
                          String(row.optionD || '').trim();

                      const correctAnswer =
                          String(row.correctAnswer || '')
                              .trim()
                              .toUpperCase();

                      const explanation =
                          String(row.explanation || '').trim();


                      // ==========================================
                      // KIỂM TRA NỘI DUNG
                      // ==========================================

                      if (!content) {
                          throw new Error(
                              `Dòng ${i + 2}: thiếu nội dung câu hỏi.`
                          );
                      }


                      if (!categoryName) {
                          throw new Error(
                              `Dòng ${i + 2}: thiếu môn học.`
                          );
                      }


                      if (!optionA || !optionB || !optionC || !optionD) {
                          throw new Error(
                              `Dòng ${i + 2}: phải có đủ 4 đáp án A, B, C, D.`
                          );
                      }


                      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                          throw new Error(
                              `Dòng ${i + 2}: đáp án đúng phải là A, B, C hoặc D.`
                          );
                      }


                      // ==========================================
                      // KIỂM TRA ĐỘ KHÓ
                      // ==========================================

                      const difficultyMap = {
                          easy: 'easy',
                          'dễ': 'easy',

                          medium: 'medium',
                          'trung bình': 'medium',

                          hard: 'hard',
                          'khó': 'hard',
                      };

                      const difficultyValue =
                          difficultyMap[difficulty];

                      if (!difficultyValue) {
                          throw new Error(
                              `Dòng ${i + 2}: độ khó không hợp lệ.`
                          );
                      }


                      // ==========================================
                      // TÌM ID MÔN HỌC
                      // ==========================================

                      const subject = subjectList.find(
                          (item) =>
                              item.name
                                  ?.trim()
                                  .toLowerCase() ===
                              categoryName
                                  .trim()
                                  .toLowerCase()
                      );

                      if (!subject) {
                          throw new Error(
                              `Dòng ${i + 2}: không tìm thấy môn học "${categoryName}" trong hệ thống.`
                          );
                      }


                      // ==========================================
                      // TẠO OBJECT QUESTION
                      // ==========================================

                      const question = {
                          content,

                          category: subject._id,

                          difficulty: difficultyValue,

                          explanation,

                          options: [
                              {
                                  text: optionA,
                                  isCorrect: correctAnswer === 'A',
                              },
                              {
                                  text: optionB,
                                  isCorrect: correctAnswer === 'B',
                              },
                              {
                                  text: optionC,
                                  isCorrect: correctAnswer === 'C',
                              },
                              {
                                  text: optionD,
                                  isCorrect: correctAnswer === 'D',
                              },
                          ],
                      };

                      // ==== CHẶN TRÙNG: bỏ qua câu trùng trong file hoặc đã có trong ngân hàng ====
                      const contentKey = content.trim().toLowerCase();
                      if (seenContents.has(contentKey) || existingContents.has(contentKey)) {
                        skippedDuplicateCount += 1;
                        continue;
                      }
                      seenContents.add(contentKey);

                      importedQuestions.push(question);
                  }


                  // ==========================================
                  // LƯU TỪNG CÂU HỎI VÀO DATABASE
                  // ==========================================

                    const importedQuestionKeys = new Set();
                    for (const question of importedQuestions) {
                      const key = getQuestionDuplicateKey(question);
                      if (duplicateQuestionKeys.has(key) || importedQuestionKeys.has(key)) {
                        throw new Error(
                          `Câu hỏi "${question.content}" bị trùng trong ngân hàng hoặc trong file CSV.`
                        );
                      }
                      importedQuestionKeys.add(key);
                    }

                  const savedQuestions = [];

                  for (const question of importedQuestions) {

                      const response =
                          await questionService.createQuestion(
                              question
                          );

                      const savedQuestion =
                          response?.data || response;

                      savedQuestions.push(savedQuestion);
                  }


                  // ==========================================
                  // CẬP NHẬT DANH SÁCH TRÊN GIAO DIỆN
                  // ==========================================

                  setQuestions((prev) => [
                      ...savedQuestions,
                      ...prev,
                  ]);


                  // ==========================================
                  // THÔNG BÁO
                  // ==========================================

                  const dupNote =
                    skippedDuplicateCount > 0
                      ? `, bỏ qua ${skippedDuplicateCount} câu trùng`
                      : '';
                  showToast(
                      `Đã nhập thành công ${savedQuestions.length} câu hỏi từ file CSV${dupNote}.`,
                      'success'
                  );

              } catch (error) {

                  console.error(
                      'Lỗi import CSV:',
                      error
                  );

                  showToast(
                      error.message ||
                      'Không thể nhập câu hỏi từ file CSV.',
                      'error'
                  );

              } finally {

                  setIsImportingCSV(false);

                  // Cho phép chọn lại chính file đó
                  event.target.value = '';
              }
          },

          error: (error) => {

              console.error(
                  'Lỗi đọc CSV:',
                  error
              );

              setIsImportingCSV(false);

              showToast(
                  'Không thể đọc file CSV.',
                  'error'
              );

event.target.value = '';
          },
      });
      })
      .catch((error) => {
        console.error('Lỗi đọc file CSV:', error);
        setIsImportingCSV(false);
        showToast('Không thể đọc file CSV.', 'error');
        event.target.value = '';
      });
  };

  return (
    <div className="dash-shell">
      <TeacherSidebar />

      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Ngân hàng câu hỏi</p>
            <p className="dash-subtitle">Quản lý và tổ chức kho câu hỏi trắc nghiệm của bạn.</p>
          </div>
          <div className="overview-actions">
            <button className="btn-start" type="button" onClick={() => handleOpenForm(null)}> +Thêm câu hỏi mới </button>
          </div>
        </header>
        
        {toast.show && (
          <div className={`toast toast--${toast.type}`}>
            {toast.type === "success" ? <FiCheckCircle className="toast-icon" />
              : toast.type === "warning" ? <FiAlertTriangle className="toast-icon" />
              : <FiXCircle className="toast-icon" />}
            <span>{toast.text}</span>
          </div>
        )}        

        {duplicateQuestionKeys.size > 0 && (
          <div className="notice notice-warning" role="alert">
            <FiAlertTriangle />
            <span>
              Cảnh báo: ngân hàng đang có {duplicateQuestionKeys.size} nhóm câu hỏi trùng nội dung trong cùng môn học.
            </span>
          </div>
        )}


        {showForm ? (
          <section className="question-form-panel">

            {/* HEADER */}
            <div className="question-form-header">
              <div>
                <h3>Thêm câu hỏi mới</h3>

                <p className="panel-subtitle">
                  Nhập câu hỏi trực tiếp lên giao diện, không cần bật hộp thoại.
                </p>
              </div>

              <button
                className="btn-outline btn-small"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setQuestionForms([]);
                }}
              >
                <FiX size={20} />
              </button>
            </div>


            {/* FORM NHIỀU CÂU HỎI */}
            <form onSubmit={handleSubmitQuestions}>

              {questionForms.map((question, questionIndex) => (

                <div
                  className="question-create-card"
                  key={questionIndex}
                >

                  {/* TIÊU ĐỀ */}
                  <div className="question-create-title">
                    Câu hỏi số {questionIndex + 1} *
                  </div>


                  {/* NỘI DUNG CÂU HỎI */}
                  <textarea
                    className="question-create-content"
                    placeholder="Nhập câu hỏi của bạn tại đây..."
                    value={question.content}
                    onChange={(event) =>
                      handleQuestionChange(
                        questionIndex,
                        'content',
                        event.target.value
                      )
                    }
                    required
                  />

                  {/* MÔN HỌC + ĐỘ KHÓ */}
                  <div className="question-create-info-row">

                    {/* MÔN HỌC */}
                    <div className="question-create-field">
                      <label>Môn học</label>

                      <select
                        className="form-input"
                        value={question.category}
                        onChange={(event) =>
                          handleQuestionChange(
                            questionIndex,
                            'category',
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          -- Chọn môn học --
                        </option>

                        {subjectList.map((sub) => (
                          <option
                            key={sub._id}
                            value={sub._id}
                          >
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* ĐỘ KHÓ */}
                    <div className="question-create-field">
                      <label>Độ khó</label>

                      <select
                        className="form-input"
                        value={question.difficulty}
                        onChange={(event) =>
                          handleQuestionChange(
                            questionIndex,
                            'difficulty',
                            event.target.value
                          )
                        }
                      >
                        <option value="easy">
                          Dễ
                        </option>

                        <option value="medium">
                          Trung bình
                        </option>

                        <option value="hard">
                          Khó
                        </option>
                      </select>
                    </div>

                  </div>                  


                  {/* ĐÁP ÁN A + B */}
                  <div className="question-create-grid">

                    {/* A */}
                    <div className="question-create-field">
                      <label>
                        Đáp án A *
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        placeholder="Phương án A"
                        value={question.options[0].text}
                        onChange={(event) =>
                          handleQuestionOptionChange(
                            questionIndex,
                            0,
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>


                    {/* B */}
                    <div className="question-create-field">
                      <label>
                        Đáp án B *
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        placeholder="Phương án B"
                        value={question.options[1].text}
                        onChange={(event) =>
                          handleQuestionOptionChange(
                            questionIndex,
                            1,
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>


                    {/* C */}
                    <div className="question-create-field">
                      <label>
                        Đáp án C *
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        placeholder="Phương án C"
                        value={question.options[2].text}
                        onChange={(event) =>
                          handleQuestionOptionChange(
                            questionIndex,
                            2,
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>


                    {/* D */}
                    <div className="question-create-field">
                      <label>
                        Đáp án D *
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        placeholder="Phương án D"
                        value={question.options[3].text}
                        onChange={(event) =>
                          handleQuestionOptionChange(
                            questionIndex,
                            3,
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>


                    {/* ĐÁP ÁN ĐÚNG */}
                    <div className="question-create-field">
                      <label>
                        Đáp án đúng nhất
                      </label>

                      <select
                        className="form-input"
                        value={
                          question.options.findIndex(
                            (option) => option.isCorrect
                          ) >= 0
                            ? question.options.findIndex(
                                (option) => option.isCorrect
                              )
                            : ''
                        }
                        onChange={(event) =>
                          handleQuestionCorrectChange(
                            questionIndex,
                            Number(event.target.value)
                          )
                        }
                      >
                        <option value="">
                          Chọn đáp án đúng
                        </option>

                        <option value="0">
                          Đáp án A
                        </option>

                        <option value="1">
                          Đáp án B
                        </option>

                        <option value="2">
                          Đáp án C
                        </option>

                        <option value="3">
                          Đáp án D
                        </option>
                      </select>
                    </div>


                    {/* GIẢI THÍCH */}
                    <div className="question-create-field">
                      <label>
                        Lời giải thích chi tiết
                      </label>

                      <input
                        className="form-input"
                        type="text"
                        placeholder="Nhập giải thích sau khi hoàn thành thi..."
                        value={question.explanation}
                        onChange={(event) =>
                          handleQuestionChange(
                            questionIndex,
                            'explanation',
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>


                  {/* NẾU CÓ NHIỀU CÂU THÌ CHO XÓA */}
                  {questionForms.length > 1 && (
                    <button
                      type="button"
                      className="remove-question-btn"
                      onClick={() =>
                        handleRemoveQuestionForm(questionIndex)
                      }
                    >
                      <RxCross2 size={16} />
                      Xóa câu hỏi này
                    </button>
                  )}

                </div>

              ))}


              {/* THÊM CÂU HỎI TIẾP THEO */}
              <button
                type="button"
                className="add-next-question-btn"
                onClick={handleAddNextQuestion}
              >
                <span>+</span>
                Thêm câu hỏi tiếp theo
              </button>


              {/* NÚT CUỐI FORM */}
              <div className="question-form-actions">

                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => {
                    setQuestionForms([]);
                    setShowForm(false);
                  }}
                >
                  Hủy
                </button>

                <button
                  className="btn-start"
                  type="submit"
                >
                  Lưu câu hỏi
                </button>

              </div>

            </form>

          </section>
        ) : null}

        {showEditModal ? (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Chỉnh sửa câu hỏi</h3>
                <button className="modal-close-btn" type="button" onClick={() => setShowEditModal(false)}> <FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="field-label">Nội dung câu hỏi</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.content}
                  onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                  required
                />

                <div className="modal-row">

                  <div className="modal-field">
                    <label className="field-label">Môn học</label>

                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          category: event.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn môn học --</option>

                      {subjectList.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label className="field-label">Độ khó</label>

                    <select
                      className="form-input"
                      value={formData.difficulty}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          difficulty: event.target.value,
                        })
                      }
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                </div>

                <label className="field-label">Đáp án</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="question-answer-row">
                    <input
                      className="form-input"
                      type="text"
                      placeholder={`Đáp án ${index + 1}`}
                      value={option.text}
                      onChange={(event) => handleOptionChange(index, 'text', event.target.value)}
                      required
                    />
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={Boolean(option.isCorrect)}
                        onChange={() => {
                          const nextOptions = formData.options.map((item, idx) => ({ ...item, isCorrect: idx === index }));
                          setFormData({ ...formData, options: nextOptions });
                        }}
                      />
                      Đúng
                    </label>
                  </div>
                ))}

                <label className="field-label">Giải thích</label>
                <textarea
                  className="form-input"
                  rows="1"
                  value={formData.explanation}
                  onChange={(event) => setFormData({ ...formData, explanation: event.target.value })}
                />

                <div className="modal-actions">
                  <button className="btn-outline" type="button" onClick={() => { setShowEditModal(false); setFormData(emptyForm); }}>Hủy</button>
                  <button className="btn-start" type="submit">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <section className="question-bank-toolbar question-bank-header">
          <div className="question-bank-search">
            <input
              className="search-input"
              type="text"
              placeholder="Tìm kiếm theo nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/*
          <div className="question-page-actions">
            <div className="filter-select">
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Tất cả mức độ</option>
                <option> Dễ</option>
                <option> Trung bình</option>
                <option> Khó</option>
              </select>
            </div>
            <div className="filter-select">
              <select className="form-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
              </select>
            </div>
          </div>*/}

          <div className="question-page-actions">

            {/* LỌC MỨC ĐỘ */}
            <div className="filter-select">
              <select
                className="form-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Tất cả">
                  Tất cả mức độ
                </option>

                <option value="Dễ">
                  Dễ
                </option>

                <option value="Trung bình">
                  Trung bình
                </option>

                <option value="Khó">
                  Khó
                </option>
              </select>
            </div>


            {/* SẮP XẾP */}
            <div className="filter-select">
              <select
                className="form-input"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">
                  Mới nhất
                </option>

                <option value="oldest">
                  Cũ nhất
                </option>
              </select>
            </div>


            {/* NHẬP CSV */}
            <button
              type="button"
              className="btn-import-csv"
              onClick={handleCSVButtonClick}
              disabled={isImportingCSV}
            >
              <FiUpload size={17} />

              {isImportingCSV
                ? 'Đang nhập...'
                : 'Nhập file CSV'}
            </button>

            {/* TẢI FILE MẪU */}
            <button
              type="button"
              className="btn-import-csv"
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu
            </button>

          </div>

        </section>
            <input
                id="question-csv-input"
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleCSVImport}
            />        

        <section className="question-bank-toolbar question-filter-panel">
          <div className="question-filter-scroll">
            <div className="question-filter-row">
              <button
                className={`filter-pill ${selectedSubject === 'Tất cả' ? 'active' : ''}`}
                onClick={() => setSelectedSubject('Tất cả')}
              >
                Tất cả
              </button>

              {subjectList.map((sub) => (
                <button
                  key={sub._id}
                  className={`filter-pill ${selectedSubject === sub._id ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(sub._id)}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
          <div className="table-header-actions">
            <p className="table-header-note">Hiển thị 1-{filteredQuestions.length} trong số {questions.length} câu hỏi</p>
          </div>
        </section>

        <div className="question-bank-table-container">
          {loading ? (
            <p>Đang tải câu hỏi...</p>
          ) : (
            <table className="question-bank-table">
              <thead>
                <tr>
                  <th>Nội dung câu hỏi</th>
                  <th>Môn học</th>
                  <th>Độ khó</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuestions.map((item) => (
                  <tr
                    key={item._id || item.id}
                    className={duplicateQuestionKeys.has(getQuestionDuplicateKey(item)) ? 'question-row--duplicate' : ''}
                  >
                    <td className="question-bank-row-title">
                      <div>
                        {item.content}
                        {duplicateQuestionKeys.has(getQuestionDuplicateKey(item)) && (
                          <span className="duplicate-question-badge">Trùng nội dung</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{getSubjectName(item.category)}</span>
                    </td>
                    <td>
                      <span className={`difficulty-pill difficulty-pill--${item.difficulty === 'easy' ? 'easy' : item.difficulty === 'hard' ? 'hard' : 'medium'}`}>
                        {item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                      </span>
                    </td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <div className="question-card-actions">
                        <button className="btn-outline btn-small" type="button" onClick={() => handleOpenEditModal(item)}><HiOutlinePencilSquare size={16} /></button>
                        <button className="btn-outline btn-small" type="button" onClick={() => handleDelete(item._id)}><RiDeleteBin3Line size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button
            className="btn-outline btn-small"
            disabled={questionPage === 1}
            onClick={() => setQuestionPage((p) => p - 1)}
          >
            ← Trước
          </button>

          {Array.from(
            { length: totalQuestionPages },
            (_, i) => (
              <button
                key={i}
                className={`page-btn ${
                  questionPage === i + 1
                    ? "page-btn--active"
                    : ""
                }`}
                onClick={() => setQuestionPage(i + 1)}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            className="btn-outline btn-small"
            disabled={
              questionPage === totalQuestionPages ||
              totalQuestionPages === 0
            }
            onClick={() => setQuestionPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuestionManager;
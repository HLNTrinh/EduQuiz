import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaPlay, 
  FaGraduationCap, 
  FaUsers, 
  FaRegClock, 
  FaCheck, 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaTrophy, 
  FaAward, 
  FaShareAlt, 
  FaGlobe, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaQuoteRight, 
  FaChevronLeft, 
  FaChevronRight, 
  FaCheckCircle, 
  FaClock, 
  FaRedo 
} from 'react-icons/fa';
import { 
  MdAdminPanelSettings, 
  MdSchool, 
  MdModeEdit, 
  MdBarChart, 
  MdElectricBolt, 
  MdPlaylistAddCheck, 
  MdGroup, 
  MdOutlineQuiz 
} from 'react-icons/md';

import '../styles/EduQuiz.css';

// --- MOCK DATA ---
const DEFAULT_QUIZZES = [
  {
    id: 'toan-hoc',
    title: 'Toán học đại số - Lớp 12',
    icon: <MdSchool />,
    questionsCount: 5,
    duration: 300, // 5 minutes in seconds
    difficulty: 'Trung bình',
    questions: [
      {
        text: 'Tìm đạo hàm của hàm số y = x^3 - 3x^2 + 2x - 1 tại điểm x = 1.',
        choices: [
          'y\'(1) = 1',
          'y\'(1) = -1',
          'y\'(1) = 2',
          'y\'(1) = 0'
        ],
        correctAnswerIndex: 1,
        explanation: 'Ta có y\' = 3x^2 - 6x + 2. Thay x = 1 vào ta được y\'(1) = 3(1)^2 - 6(1) + 2 = 3 - 6 + 2 = -1.'
      },
      {
        text: 'Phương trình log2(x - 1) = 3 có nghiệm là:',
        choices: [
          'x = 7',
          'x = 9',
          'x = 8',
          'x = 10'
        ],
        correctAnswerIndex: 1,
        explanation: 'log2(x - 1) = 3 <=> x - 1 = 2^3 = 8 <=> x = 9.'
      },
      {
        text: 'Tính thể tích V của khối cầu có bán kính R = 3.',
        choices: [
          'V = 36π',
          'V = 12π',
          'V = 108π',
          'V = 27π'
        ],
        correctAnswerIndex: 0,
        explanation: 'Thể tích khối cầu V = (4/3) * π * R^3 = (4/3) * π * 3^3 = 36π.'
      },
      {
        text: 'Cho tích phân ∫ (từ 0 đến 1) của e^x dx. Kết quả bằng:',
        choices: [
          'e',
          'e - 1',
          'e + 1',
          '1'
        ],
        correctAnswerIndex: 1,
        explanation: '∫e^x dx = e^x | từ 0 đến 1 = e^1 - e^0 = e - 1.'
      },
      {
        text: 'Số phức z = 3 - 4i có môđun bằng:',
        choices: [
          '|z| = 7',
          '|z| = 5',
          '|z| = 25',
          '|z| = 1'
        ],
        correctAnswerIndex: 1,
        explanation: 'Môđun của số phức z = a + bi là |z| = √(a^2 + b^2). Với z = 3 - 4i, ta có |z| = √(3^2 + (-4)^2) = √(9 + 16) = √25 = 5.'
      }
    ]
  },
  {
    id: 'tieng-anh',
    title: 'Ngữ pháp Tiếng Anh - THPT Quốc Gia',
    icon: <FaGlobe />,
    questionsCount: 5,
    duration: 300,
    difficulty: 'Khó',
    questions: [
      {
        text: 'If I ______ enough money last year, I would have traveled around the world.',
        choices: [
          'had',
          'had had',
          'would have',
          'have had'
        ],
        correctAnswerIndex: 1,
        explanation: 'Đây là câu điều kiện loại 3 (diễn tả sự việc không có thật trong quá khứ). Cấu trúc: If + S + had + V3/V-ed, S + would have + V3/V-ed.'
      },
      {
        text: 'The book ______ by Jack London is very interesting.',
        choices: [
          'writing',
          'written',
          'wrote',
          'which written'
        ],
        correctAnswerIndex: 1,
        explanation: 'Sử dụng mệnh đề quan hệ rút gọn ở dạng bị động. "The book which was written by Jack London" rút gọn thành "The book written by Jack London".'
      },
      {
        text: 'We decided to go for a walk ______ the heavy rain.',
        choices: [
          'because of',
          'although',
          'despite',
          'in spite'
        ],
        correctAnswerIndex: 2,
        explanation: 'Despite + Noun Phrase/V-ing mang ý nghĩa "Mặc dù". Heavy rain là cụm danh từ nên dùng despite (in spite phải đi với of, although đi với một mệnh đề).'
      },
      {
        text: 'She is the most intelligent student ______ I have ever met.',
        choices: [
          'which',
          'whom',
          'that',
          'whose'
        ],
        correctAnswerIndex: 2,
        explanation: 'Trong câu so sánh nhất, đại từ quan hệ "that" được ưu tiên sử dụng thay thế cho "who" hoặc "whom/which".'
      },
      {
        text: 'By the time she arrives tomorrow, we ______ the project.',
        choices: [
          'will finish',
          'will have finished',
          'finished',
          'are finishing'
        ],
        correctAnswerIndex: 1,
        explanation: 'Cấu trúc: By the time + S + V(hiện tại đơn), S + V(tương lai hoàn thành). Tương lai hoàn thành: will have + V3/V-ed.'
      }
    ]
  },
  {
    id: 'tin-hoc',
    title: 'Lập trình Web Cơ bản (HTML/CSS/JS)',
    icon: <MdOutlineQuiz />,
    questionsCount: 5,
    duration: 300,
    difficulty: 'Dễ',
    questions: [
      {
        text: 'Thuộc tính CSS nào được dùng để thay đổi màu chữ của một phần tử?',
        choices: [
          'text-color',
          'color',
          'font-color',
          'background-color'
        ],
        correctAnswerIndex: 1,
        explanation: 'Thuộc tính "color" trong CSS được sử dụng để định nghĩa màu chữ cho văn bản của phần tử.'
      },
      {
        text: 'Trong JavaScript, phương thức nào dùng để chuyển đổi chuỗi sang số nguyên?',
        choices: [
          'parseInt()',
          'parseFloat()',
          'Integer.parse()',
          'toString()'
        ],
        correctAnswerIndex: 0,
        explanation: 'Hàm parseInt() phân tích một chuỗi tham số và trả về một số nguyên tương ứng.'
      },
      {
        text: 'Thẻ HTML nào được dùng để liên kết các tệp CSS bên ngoài?',
        choices: [
          '<style>',
          '<link>',
          '<script>',
          '<css>'
        ],
        correctAnswerIndex: 1,
        explanation: 'Thẻ <link rel="stylesheet" href="style.css"> được khai báo trong thẻ <head> để nạp tệp CSS bên ngoài.'
      },
      {
        text: 'Kết quả của biểu thức sau trong JavaScript là gì: "5" + 2 ?',
        choices: [
          '7',
          '52',
          'NaN',
          'undefined'
        ],
        correctAnswerIndex: 1,
        explanation: 'Toán tử "+" khi có một toán hạng là chuỗi sẽ thực hiện phép nối chuỗi. Do đó "5" + 2 sẽ bằng "52".'
      },
      {
        text: 'Sự kiện nào xảy ra khi người dùng nhấp chuột vào một phần tử HTML?',
        choices: [
          'onmouseover',
          'onchange',
          'onclick',
          'onsubmit'
        ],
        correctAnswerIndex: 2,
        explanation: 'Sự kiện "onclick" được kích hoạt khi người dùng nhấp chuột trái vào phần tử.'
      }
    ]
  }
];

export default function EduQuizPage() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' or 'test' or 'creator'
  const [quizzes, setQuizzes] = useState(DEFAULT_QUIZZES);
  //khai báo ddeeer nó bấm đăng nhaoaj qua đăng nhaoaj 
  const navigate = useNavigate();
  // Quiz Player State
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: choiceIndex }
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const timerRef = useRef(null);

  // Custom Quiz Creator State
  const [customQuizTitle, setCustomQuizTitle] = useState('');
  const [customQuizDifficulty, setCustomQuizDifficulty] = useState('Trung bình');
  const [customQuestions, setCustomQuestions] = useState([
    {
      text: '',
      choices: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    }
  ]);

  // Smooth scroll helper
  const scrollToPlayground = () => {
    const element = document.getElementById('eduquiz-playground');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Timer logic
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizSubmitted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted && !quizSubmitted) {
      handleQuizSubmit();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [quizStarted, timeLeft, quizSubmitted]);

  // Handle start quiz
  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(quiz.duration);
    setQuizStarted(true);
    setQuizSubmitted(false);
    setActiveTab('test');
    scrollToPlayground();
  };

  // Handle select answer
  const handleSelectAnswer = (choiceIndex) => {
    if (quizSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: choiceIndex
    });
  };

  // Handle submit test
  const handleQuizSubmit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuizSubmitted(true);
    scrollToPlayground();
  };

  // Reset current quiz
  const handleRestartQuiz = () => {
    if (selectedQuiz) {
      handleStartQuiz(selectedQuiz);
    }
  };

  // Calculate results
  const calculateScore = () => {
    if (!selectedQuiz) return { score: 0, correctCount: 0, accuracy: 0 };
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    const totalQuestions = selectedQuiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    return { score, correctCount, accuracy };
  };

  // Creator add question
  const handleAddCreatorQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        text: '',
        choices: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: ''
      }
    ]);
  };

  // Creator remove question
  const handleRemoveCreatorQuestion = (index) => {
    if (customQuestions.length <= 1) return;
    setCustomQuestions(customQuestions.filter((_, idx) => idx !== index));
  };

  // Creator field updates
  const updateQuestionText = (index, val) => {
    const updated = [...customQuestions];
    updated[index].text = val;
    setCustomQuestions(updated);
  };

  const updateChoiceText = (qIndex, cIndex, val) => {
    const updated = [...customQuestions];
    updated[qIndex].choices[cIndex] = val;
    setCustomQuestions(updated);
  };

  const updateCorrectIndex = (qIndex, val) => {
    const updated = [...customQuestions];
    updated[qIndex].correctAnswerIndex = parseInt(val, 10);
    setCustomQuestions(updated);
  };

  const updateExplanationText = (index, val) => {
    const updated = [...customQuestions];
    updated[index].explanation = val;
    setCustomQuestions(updated);
  };

  // Save custom quiz
  const handleSaveCustomQuiz = (e) => {
    e.preventDefault();
    if (!customQuizTitle.trim()) {
      alert('Vui lòng nhập tiêu đề đề thi!');
      return;
    }

    // Validate that questions are filled
    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      if (!q.text.trim()) {
        alert(`Vui lòng nhập câu hỏi số ${i + 1}!`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.choices[j].trim()) {
          alert(`Vui lòng nhập đầy đủ đáp án ${String.fromCharCode(65 + j)} cho câu hỏi số ${i + 1}!`);
          return;
        }
      }
    }

    const newQuizId = `custom-${Date.now()}`;
    const newQuiz = {
      id: newQuizId,
      title: customQuizTitle,
      icon: <MdOutlineQuiz />,
      questionsCount: customQuestions.length,
      duration: customQuestions.length * 60, // 1 minute per question
      difficulty: customQuizDifficulty,
      questions: customQuestions
    };

    setQuizzes([newQuiz, ...quizzes]);
    // Reset Creator Form
    setCustomQuizTitle('');
    setCustomQuestions([
      {
        text: '',
        choices: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: ''
      }
    ]);
    // Alert & Start
    alert('Đã tạo đề thi của bạn thành công!');
    handleStartQuiz(newQuiz);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="eduquiz-body">
      {/* Header Section */}
      <header className="eduquiz-header">
        <div className="eduquiz-container eduquiz-header-container">
          <a href="#" className="eduquiz-logo">
            <FaGraduationCap className="eduquiz-logo-icon" />
            EduQuiz <span className="eduquiz-logo-dot"></span>
          </a>
          <ul className="eduquiz-nav">
            <li>
              <a 
                href="#" 
                className={`eduquiz-nav-link ${activeTab === 'landing' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('landing'); }}
              >
                Trang chủ
              </a>
            </li>
            <li>
              <a 
                href="#features" 
                className="eduquiz-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Tính năng
              </a>
            </li>
            <li>
              <a 
                href="#roles" 
                className="eduquiz-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('roles-section').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Giới thiệu
              </a>
            </li>
            <li>
              <a 
                href="#footer" 
                className="eduquiz-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer-section').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Liên hệ
              </a>
            </li>
          </ul>
          <div className="eduquiz-auth-btns">
            <button className="btn btn-text" onClick={() => navigate('/login')}>Đăng nhập</button>
            <button className="btn btn-primary" onClick={scrollToPlayground}>Dùng thử ngay</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="eduquiz-container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Nền tảng thi <br />
              trắc nghiệm <br />
              <span>trực tuyến</span> thông minh
            </h1>
            <p className="hero-description">
              Tổ chức thi cử hiện đại, tối ưu hóa quy trình chấm điểm và thống kê. Giải pháp toàn diện dành cho giáo viên, trường học và doanh nghiệp.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={scrollToPlayground}>
                Dùng thử ngay <FaArrowRight />
              </button>
              <button className="btn btn-outline btn-large" onClick={scrollToPlayground}>
                <FaPlay style={{ fontSize: '12px' }} /> Xem demo
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="mockup-container">
              <div className="mockup-screen">
                <div className="mockup-header">
                  <span className="mockup-dot red"></span>
                  <span className="mockup-dot yellow"></span>
                  <span className="mockup-dot green"></span>
                  <div className="mockup-address">https://eduquiz.vn/dashboard</div>
                </div>
                <div className="mockup-body">
                  <div className="mock-dashboard">
                    <div className="mock-row">
                      <div className="mock-card">
                        <h4>LƯỢT THI</h4>
                        <p>12,480</p>
                      </div>
                      <div className="mock-card">
                        <h4>TỶ LỆ HOÀN THÀNH</h4>
                        <p>94.8%</p>
                      </div>
                    </div>
                    <div className="mock-card" style={{ flexGrow: 1 }}>
                      <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>PHÂN TÍCH HIỆU SUẤT THI</span>
                        <span style={{ color: '#00fa9a' }}>Tuần này</span>
                      </h4>
                      <div className="mock-bar-chart">
                        <div className="mock-bar" style={{ height: '40%' }}></div>
                        <div className="mock-bar" style={{ height: '75%' }}></div>
                        <div className="mock-bar" style={{ height: '55%' }}></div>
                        <div className="mock-bar" style={{ height: '90%' }}></div>
                        <div className="mock-bar" style={{ height: '65%' }}></div>
                        <div className="mock-bar" style={{ height: '80%' }}></div>
                        <div className="mock-bar" style={{ height: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="badge-float">
              <div className="badge-icon">
                <MdBarChart />
              </div>
              <div className="badge-text">
                <p>Hiệu suất học sinh</p>
                <p style={{ color: '#006e2f' }}>+24% tháng này</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features-section">
        <div className="eduquiz-container">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <span className="section-tag">Tính năng nổi bật</span>
            <h2 className="section-title">Công cụ mạnh mẽ cho giáo dục số</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdElectricBolt />
              </div>
              <h3>Tạo đề thi nhanh</h3>
              <p>Nhập liệu từ file Word, Excel hoặc sử dụng ngân hàng câu hỏi thông minh có sẵn.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdPlaylistAddCheck />
              </div>
              <h3>Chấm điểm tự động</h3>
              <p>Kết quả được hiển thị ngay lập tức sau khi nộp bài với độ chính xác tuyệt đối.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdBarChart />
              </div>
              <h3>Thống kê kết quả</h3>
              <p>Phân tích dữ liệu trực quan về tỷ lệ làm đúng, điểm trung bình và biểu đồ phổ điểm.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdGroup />
              </div>
              <h3>Quản lý học sinh</h3>
              <p>Tổ chức lớp học, theo dõi tiến độ học tập và lịch sử thi cử của từng cá nhân.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quiz Testing Section (PLAYGROUND) */}
      <section className="playground-section" id="eduquiz-playground">
        <div className="eduquiz-container">
          <div className="playground-header text-center">
            <span className="section-tag" style={{ color: 'var(--color-primary)' }}>Trải nghiệm trực tuyến</span>
            <h2 className="section-title">Hệ thống thi thử và tạo đề thi EduQuiz</h2>
            <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Hãy chọn một đề thi mẫu dưới đây để bắt đầu làm bài ngay lập tức, hoặc tự tạo một đề thi tùy chỉnh cho riêng bạn!
            </p>
          </div>

          <div className="playground-tabs">
            <button 
              className={`tab-btn ${activeTab === 'landing' || activeTab === 'test' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('landing');
                setQuizStarted(false);
                setSelectedQuiz(null);
              }}
            >
              <MdPlaylistAddCheck /> Chọn đề thi mẫu
            </button>
            <button 
              className={`tab-btn ${activeTab === 'creator' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('creator');
                setQuizStarted(false);
                
                setSelectedQuiz(null);
              }}
            >
              <MdModeEdit /> Tự biên soạn đề thi mới
            </button>
          </div>

          <div className="playground-content">
            {/* Mode 1: Choosing a Test (Standard Landing on playground) */}
            {activeTab === 'landing' && !quizStarted && (
              <div className="quiz-selector">
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Danh sách đề thi có sẵn</h3>
                  <p className="text-muted" style={{ fontSize: '14px' }}>Chọn một đề tài và trải nghiệm hệ thống chấm điểm tự động và đếm giờ thông minh.</p>
                </div>
                <div className="quiz-grid">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className={`quiz-card ${selectedQuiz?.id === quiz.id ? 'selected' : ''}`}
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <div className="quiz-card-icon">
                        {quiz.icon}
                      </div>
                      <h4>{quiz.title}</h4>
                      <p>Số câu hỏi: <strong>{quiz.questionsCount} câu</strong></p>
                      <p>Thời gian: <strong>{quiz.duration / 60} phút</strong></p>
                      <p>Mức độ: <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        backgroundColor: quiz.difficulty === 'Dễ' ? 'var(--color-secondary-light)' : quiz.difficulty === 'Khó' ? 'var(--color-accent-orange-light)' : 'var(--color-primary-light)',
                        color: quiz.difficulty === 'Dễ' ? 'var(--color-secondary)' : quiz.difficulty === 'Khó' ? 'var(--color-accent-orange)' : 'var(--color-primary)'
                      }}>{quiz.difficulty}</span></p>
                    </div>
                  ))}
                </div>
                <div className="selector-footer">
                  <button 
                    className="btn btn-primary btn-large" 
                    disabled={!selectedQuiz}
                    onClick={() => selectedQuiz && handleStartQuiz(selectedQuiz)}
                    style={{ opacity: selectedQuiz ? 1 : 0.6, cursor: selectedQuiz ? 'pointer' : 'not-allowed' }}
                  >
                    Bắt đầu làm bài <FaArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Active Testing Player */}
            {quizStarted && selectedQuiz && !quizSubmitted && (
              <div className="quiz-active-container">
                <div className="quiz-panel-left">
                  <div className="quiz-info-bar">
                    <div className="quiz-info-item">
                      <strong className="text-primary">{selectedQuiz.title}</strong>
                    </div>
                    <div className="quiz-info-item quiz-timer">
                      <FaClock /> <span>{formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  <div className="question-card">
                    <span className="question-number">Câu hỏi {currentQuestionIndex + 1} / {selectedQuiz.questions.length}</span>
                    <p className="question-text">{selectedQuiz.questions[currentQuestionIndex].text}</p>
                    
                    <div className="choices-list">
                      {selectedQuiz.questions[currentQuestionIndex].choices.map((choice, idx) => {
                        const letter = String.fromCharCode(65 + idx); // A, B, C, D
                        const isSelected = userAnswers[currentQuestionIndex] === idx;
                        return (
                          <div 
                            key={idx}
                            className={`choice-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectAnswer(idx)}
                          >
                            <span className="choice-letter">{letter}</span>
                            <span>{choice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="quiz-nav-btns">
                    <button 
                      className="btn btn-outline" 
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      style={{ visibility: currentQuestionIndex === 0 ? 'hidden' : 'visible' }}
                    >
                      <FaChevronLeft /> Câu trước
                    </button>
                    {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                      <button 
                        className="btn btn-outline" 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      >
                        Câu tiếp theo <FaChevronRight />
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={handleQuizSubmit}>
                        Nộp bài thi <FaCheck />
                      </button>
                    )}
                  </div>
                </div>

                <div className="quiz-panel-right">
                  <div className="right-panel-box">
                    <span className="panel-title">Phiếu trả lời</span>
                    <div className="nav-grid">
                      {selectedQuiz.questions.map((_, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isAnswered = userAnswers[idx] !== undefined;
                        return (
                          <button 
                            key={idx}
                            className={`nav-cell ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                            onClick={() => setCurrentQuestionIndex(idx)}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="legend">
                      <div className="legend-item">
                        <span className="legend-color curr"></span>
                        <span>Đang làm</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color ans"></span>
                        <span>Đã trả lời</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Quiz Finished & Submitted Results Screen */}
            {quizStarted && selectedQuiz && quizSubmitted && (
              <div className="results-container">
                <div className="results-summary-card">
                  <div className="score-gauge-wrapper">
                    <div className="score-circle">
                      <svg className="score-svg-circle" viewBox="0 0 100 100">
                        <circle className="score-svg-bg" cx="50" cy="50" r="40" />
                        <circle 
                          className="score-svg-fill" 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          strokeDasharray={`${calculateScore().accuracy * 2.51}, 251`}
                        />
                      </svg>
                      <div className="score-value">
                        {calculateScore().score}<span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/10</span>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginTop: '12px' }}>Hoàn thành!</h4>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-dark)', marginBottom: '16px' }}>Kết quả chi tiết đề thi</h3>
                    <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
                      Cảm ơn bạn đã tham gia làm bài thi thử trên hệ thống EduQuiz. Hệ thống đã tự động ghi nhận và chấm điểm bài làm của bạn.
                    </p>
                    <div className="results-stats-grid">
                      <div className="stat-box">
                        <p>Số câu đúng</p>
                        <p style={{ color: 'var(--color-secondary)' }}>
                          {calculateScore().correctCount} / {selectedQuiz.questions.length}
                        </p>
                      </div>
                      <div className="stat-box">
                        <p>Độ chính xác</p>
                        <p style={{ color: 'var(--color-primary)' }}>{calculateScore().accuracy}%</p>
                      </div>
                      <div className="stat-box">
                        <p>Xếp loại</p>
                        <p style={{ color: calculateScore().score >= 8 ? 'var(--color-secondary)' : calculateScore().score >= 5 ? 'var(--color-primary)' : 'var(--color-accent-orange)' }}>
                          {calculateScore().score >= 8 ? 'Giỏi' : calculateScore().score >= 5 ? 'Khá' : 'Yếu'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button className="btn btn-primary" onClick={handleRestartQuiz}>
                        <FaRedo /> Làm lại bài này
                      </button>
                      <button className="btn btn-outline" onClick={() => {
                        setQuizStarted(false);
                        setSelectedQuiz(null);
                        setActiveTab('landing');
                      }}>
                        Quay lại danh sách
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question-by-question review & explanations */}
                <div className="results-review-section">
                  <h3>Thống kê đáp án và giải thích chi tiết</h3>
                  {selectedQuiz.questions.map((q, idx) => {
                    const userChoice = userAnswers[idx];
                    const isCorrect = userChoice === q.correctAnswerIndex;
                    return (
                      <div key={idx} className="review-card">
                        <div className="review-header">
                          <span className="question-number">Câu hỏi {idx + 1}</span>
                          <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                          </span>
                        </div>
                        <p className="question-text" style={{ fontSize: '16px' }}>{q.text}</p>
                        
                        <div className="choices-list">
                          {q.choices.map((choice, cIdx) => {
                            const isUserSelected = userChoice === cIdx;
                            const isCorrectChoice = q.correctAnswerIndex === cIdx;
                            let optionClass = '';
                            if (isUserSelected) optionClass = 'user-selected';
                            if (isCorrectChoice) optionClass = 'correct-choice';
                            
                            return (
                              <div key={cIdx} className={`review-option ${optionClass}`}>
                                <span className="choice-letter" style={{
                                  backgroundColor: isCorrectChoice ? 'var(--color-secondary)' : isUserSelected ? 'var(--color-accent-orange)' : '',
                                  color: (isCorrectChoice || isUserSelected) ? '#ffffff' : ''
                                }}>
                                  {String.fromCharCode(65 + cIdx)}
                                </span>
                                <span>{choice}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {q.explanation && (
                          <div className="review-explanation">
                            <strong>Lời giải thích:</strong><br />
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 4: Custom Quiz Builder Creator */}
            {activeTab === 'creator' && (
              <div className="creator-container">
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Trình biên soạn đề thi trực quan</h3>
                  <p className="text-muted" style={{ fontSize: '14px' }}>Nhập đề thi tùy chỉnh của bạn và bắt đầu tổ chức thi thử nghiệm.</p>
                </div>

                <form onSubmit={handleSaveCustomQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                      <label htmlFor="quizTitle">Tiêu đề đề thi mẫu *</label>
                      <input 
                        type="text" 
                        id="quizTitle"
                        className="form-control"
                        placeholder="Ví dụ: Đề kiểm tra thử 15 phút Toán đại số" 
                        value={customQuizTitle}
                        onChange={(e) => setCustomQuizTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="quizDiff">Độ khó đề thi</label>
                      <select 
                        id="quizDiff"
                        className="form-control"
                        value={customQuizDifficulty}
                        onChange={(e) => setCustomQuizDifficulty(e.target.value)}
                      >
                        <option value="Dễ">Dễ</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Khó">Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="creator-questions-list">
                    <h4 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                      Nội dung câu hỏi ({customQuestions.length} câu)
                    </h4>
                    
                    {customQuestions.map((question, qIdx) => (
                      <div key={qIdx} className="creator-question-box">
                        <button 
                          type="button" 
                          className="btn-delete-q"
                          onClick={() => handleRemoveCreatorQuestion(qIdx)}
                          title="Xóa câu hỏi này"
                        >
                          <FaTrash />
                        </button>
                        
                        <div className="form-group">
                          <label>Câu hỏi số {qIdx + 1} *</label>
                          <textarea 
                            rows="2" 
                            className="form-control"
                            placeholder="Nhập câu hỏi của bạn tại đây..."
                            value={question.text}
                            onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                            required
                          />
                        </div>

                        <div className="creator-options-grid">
                          <div className="form-group">
                            <label>Đáp án A *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Phương án A" 
                              value={question.choices[0]}
                              onChange={(e) => updateChoiceText(qIdx, 0, e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Đáp án B *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Phương án B" 
                              value={question.choices[1]}
                              onChange={(e) => updateChoiceText(qIdx, 1, e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Đáp án C *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Phương án C" 
                              value={question.choices[2]}
                              onChange={(e) => updateChoiceText(qIdx, 2, e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Đáp án D *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Phương án D" 
                              value={question.choices[3]}
                              onChange={(e) => updateChoiceText(qIdx, 3, e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div className="form-group">
                            <label>Đáp án đúng nhất</label>
                            <select 
                              className="form-control"
                              value={question.correctAnswerIndex}
                              onChange={(e) => updateCorrectIndex(qIdx, e.target.value)}
                            >
                              <option value="0">Đáp án A</option>
                              <option value="1">Đáp án B</option>
                              <option value="2">Đáp án C</option>
                              <option value="3">Đáp án D</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Lời giải thích chi tiết</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Nhập giải thích sau khi hoàn thành thi"
                              value={question.explanation}
                              onChange={(e) => updateExplanationText(qIdx, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={handleAddCreatorQuestion}
                    >
                      <FaPlus /> Thêm câu hỏi tiếp theo
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-large"
                    >
                      Lưu và Bắt đầu làm bài thi mẫu <FaPlay style={{ fontSize: '10px' }} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section" id="roles-section">
        <div className="eduquiz-container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 className="section-title">Phù hợp cho mọi đối tượng</h2>
            <p className="text-muted" style={{ fontSize: '16px', marginTop: '-32px' }}>Giải pháp tùy chỉnh theo nhu cầu thực tế của từng vai trò</p>
          </div>
          <div className="roles-grid">

            {/* Teacher */}
            <div className="role-card featured-role">
              <div className="role-card-content">
                <div className="role-header">
                  <span className="role-icon"><MdSchool /></span>
                  <h3>Giáo viên</h3>
                </div>
                <p className="role-description">
                  Tự do sáng tạo nội dung, tổ chức các kỳ thi linh hoạt và giảm bớt gánh nặng chấm bài thủ công.
                </p>
                <ul className="role-list">
                  <li className="role-list-item"><FaCheckCircle /> Tạo ngân hàng câu hỏi thông minh</li>
                  <li className="role-list-item"><FaCheckCircle /> Giám sát kỳ thi thời gian thực</li>
                  <li className="role-list-item"><FaCheckCircle /> Nhận xét bài thi cực chi tiết</li>
                </ul>
              </div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCygaYoPp5yFXsAZQlVF6v8eG0mL1k6izvDag7iccYJO8RXYw6ASIMJ7Ny4ESSS2kt3UpFg4jnU__eWhuqap0U1wKAq4LJdieaGsgR26uu53o-yl7Nyaok28UCQC05Joc6zz8vpY095Xvp1DRbdQvK5YQeME_9SK2H4_qfSVcyQZRkgp6RhLsofHY2TuJr2-HYOkkTj4UG3HDRslI8DOdDeeHfNkZ3WUgzgs_22gcp3fmAdDU_opcF59qMDaTnmDhWalUHIOcO6GC5F" 
                alt="Giáo viên" 
                className="role-card-image"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Student */}
            <div className="role-card">
              <div className="role-card-content">
                <div className="role-header">
                  <span className="role-icon"><MdModeEdit /></span>
                  <h3>Học sinh</h3>
                </div>
                <p className="role-description">
                  Trải nghiệm thi cử mượt mà, theo dõi được tiến trình học tập và nhận kết quả ngay tức khắc.
                </p>
                <ul className="role-list">
                  <li className="role-list-item"><FaCheckCircle /> Làm bài trên mọi thiết bị di động</li>
                  <li className="role-list-item"><FaCheckCircle /> Xem giải thích đáp án thông minh</li>
                  <li className="role-list-item"><FaCheckCircle /> Lịch sử ôn thi cá nhân hóa</li>
                </ul>
              </div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuACC-5JTumjhDeW8Yw7qBx7cAYc4SMF76pzmR6OFuDgIhvO0OrrpvoPs_xJF5-5mc6KdMldvJ_jeToAW20wjwWkXomLxolD17GgEwTiCHylynNKetVErdnqVfToAgp-Amfdp7vL8ZWOveV2RgBeJf9TgxYFMbR23uSGaRSMvBL9KtawmQTo77aSK0jYy0EC8YxdLZxfs8E_9deOO0tHY6Kiz2BdEu7Tb7FDvnDJgvUEsvSavJMey-Aof4-g11-b67G4RUaAoG340V82" 
                alt="Học sinh" 
                className="role-card-image"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="eduquiz-container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 className="section-title">Quy trình 3 bước đơn giản</h2>
          </div>
          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="workflow-step-card">
                <h4>Tạo đề thi</h4>
                <p>Tải câu hỏi từ ngân hàng hoặc nhập mới linh hoạt.</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="workflow-step-card">
                <h4>Tổ chức thi</h4>
                <p>Gửi link cho học sinh và bắt đầu kỳ thi an toàn.</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="workflow-step-card">
                <h4>Nhận báo cáo</h4>
                <p>Xem thống kê và điểm số chi tiết ngay lập tức.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="eduquiz-container testimonials-grid">
          <div className="testimonials-info">
            <span className="section-tag">Đánh giá</span>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>Được tin dùng bởi hơn 10,000+ giáo viên và học sinh</h2>
            <div className="facepile-wrapper">
              <div className="facepile">
                <img className="face" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2HHiuNfiDktFGGxnvs9ew2p1vixaBRXi-pepuXfFJC09ZjTdjQccX0OZ2lLhp2IQRM12JkVqw1Bik7345CkcabbaZ1jDQxR0NiKrWu7ca4WMzfLTxYbFbJnwWqBzFXKF3v_qwBYwRdIaynuVzOFtQXKQR6q3uVkQVSZilZs2RZhXIagU4u6Ojjv8ybp_wcvlor64M2ngcaeb9K7yynpiB3iIt3rEXGu31JS0scx58l8gPK5KCtOehpjUuFPM8qNQKaRty4Sn7Qw48" alt="User 1" referrerPolicy="no-referrer" />
                <img className="face" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwFZ1mU0B-Tlu3iZhztRpZx_VyfopXtvHRMpQt2H2QsdFy8GYRAESn9xO8n4JKWPzsvk7BhyKJaUNQlnjkqB3X_5yaFjXJD6O6GlSXBB0irixC26aCzsaz0Y-DrBdWb7U_-0lDHZHWisAHQb7ZNPhUgTxbWPU5Hb6axZgF8cMsEKpmhdYJi2pXsXSR9L9imV379iJyvKmr19KARJf8wToOaM-KDJLU71N1YpFhWeiy0rVF4pH4S9MDEFUKWYYNWMN1hVouMNlTt2-e" alt="User 2" referrerPolicy="no-referrer" />
                <img className="face" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM_NOCd_eVZFQta9YoW8dLyShyT7TcDHZEy4q6kIuw3f-kPd9eRE2f8uKW5sjfB6rnkpyRzYUwOOZvDBC-_IBGIrN31eZjpnGIB-uHiMSGondTUswJM6KD_4kRoVW5tKe7LHeLzNxZo8GUguzolrkQu-aWs9dZ50pKWhBFPReWJcYWi4GSoOx_Iytba57XcFwfE6ZCbS1N4AcYRoAnq-oVUlSKd6jUhZGMuFf1Uh58UIZGSdGrSQFNEykD-W27dn6JkDP7tUoP9nuB" alt="User 3" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="testimonial-text">⭐ 4.9/5 Rating</p>
                <p className="testimonial-rating">Dựa trên 2,500+ đánh giá thực tế từ nhà trường</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <span className="quote-icon"><FaQuoteRight /></span>
            <p className="quote-text">
              "EduQuiz đã thay đổi hoàn toàn cách tôi tổ chức kiểm tra cho học sinh. Việc chấm điểm tự động giúp tôi tiết kiệm 5-6 tiếng mỗi tuần."
            </p>
            <div className="author-info">
              <img 
                className="author-avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfRDu1cCx87zZQupgfoq-ta1sxaEXbB84p6eqyvI9Hv4-AZl8BOpQNOfVZkc-QFH3tgRMSY4IYics4RAhjm58bvV0TLxbvTsg3WgRgjKV-ATY2kjk_RLeubJsofNYU6JL5qt11jocF4xTkRYj6F--clGpDhi6EH2cVryiEM1vu1Bf-C7gKSDXy5KUmbVD8RWZ--lsdOQmOV4XsD8lM9f39ClEFi-6_HAM_7TKO-bXqxw5zzQOgMvyUQ35milW9URdA6s5tHbKRq4d-" 
                alt="Thầy Nguyễn Văn An" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h5 className="author-name">Thầy Nguyễn Văn An</h5>
                <p className="author-title">Giáo viên Toán - THPT Chuyên</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="eduquiz-container">
          {/* <div className="cta-card"> */}
          <div className="eduquiz-cta-card">
            <h2 className="cta-title">Sẵn sàng số hóa quy trình thi cử?</h2>
            <p className="cta-desc">
              Bắt đầu miễn phí ngay hôm nay và trải nghiệm sự tiện lợi của công nghệ giáo dục hàng đầu.
            </p>
            <div className="cta-actions">
              <button className="btn btn-white btn-large" onClick={scrollToPlayground}>Tạo tài khoản miễn phí</button>
              <button className="btn btn-trans btn-large" onClick={scrollToPlayground}>Liên hệ tư vấn</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="eduquiz-footer" id="footer-section">
        <div className="eduquiz-container footer-grid">
          <div className="footer-column">
            <h5 className="eduquiz-logo" style={{ marginBottom: '12px' }}>
              EduQuiz <span className="eduquiz-logo-dot"></span>
            </h5>
            <p>Nâng tầm tri thức Việt qua nền tảng thi trắc nghiệm trực tuyến hiện đại và chuyên nghiệp nhất.</p>
            <div className="social-links">
              <a href="#" className="social-icon-btn"><FaGlobe /></a>
              <a href="#" className="social-icon-btn"><FaEnvelope /></a>
              <a href="#" className="social-icon-btn"><FaShareAlt /></a>
            </div>
          </div>
          <div className="footer-column">
            <h6>Sản phẩm</h6>
            <ul className="footer-links">
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Tính năng</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Bảng giá</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Ứng dụng di động</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Cập nhật mới</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h6>Liên kết</h6>
            <ul className="footer-links">
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Giới thiệu</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Blog giáo dục</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Hướng dẫn sử dụng</a></li>
              <li className="footer-links-item"><a href="#" onClick={scrollToPlayground}>Trung tâm hỗ trợ</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h6>Thông tin liên hệ</h6>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <FaMapMarkerAlt />
                <span>Tòa nhà 123, Đường Phạm Ngũ Lão, Phường Trà Vinh, Tỉnh Vĩnh Long</span>
              </div>
              <div className="contact-info-item">
                <FaPhone />
                <span>0747 093 823</span>
              </div>
              <div className="contact-info-item">
                <FaEnvelope />
                <span>nhombaocaotvu@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="eduquiz-container footer-bottom">
          <p>© 2026 EduQuiz. Bảo lưu mọi quyền.</p>
          <div className="footer-bottom-links">
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

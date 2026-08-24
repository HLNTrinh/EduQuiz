import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const questionService = {
  createQuestion: (data) => api.post('/questions', data),
  getQuestions: async (params) => {
    const response = await api.get('/questions', { params });
    return response?.data ?? response ?? [];
  },
  // Lấy TOÀN BỘ câu hỏi trong ngân hàng bằng cách phân trang qua backend
  // (tránh giới hạn mặc định 10 câu/trang khiến thiếu câu hỏi của các môn khác)
  getAllQuestions: async (params = {}) => {
    const pageSize = params.limit || 100;
    let page = 1;
    const all = [];
    while (true) {
      const response = await api.get('/questions', { params: { ...params, page, limit: pageSize } });
      const body = response ?? {};
      const data = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      all.push(...data);
      const total = body?.pagination?.total ?? all.length;
      const pages = body?.pagination?.pages ?? Math.ceil(total / pageSize);
      if (page >= pages || data.length < pageSize) break;
      page += 1;
    }
    return all;
  },
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response?.data ?? response;
  },
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getCategories: async () => {
    const response = await api.get('/questions/categories');
    return response?.data ?? response;
  },
};

export const quizService = {
  createQuiz: async (data) => {
    const response = await api.post('/quizzes', data);
    return response?.data ?? response;
  },
  getQuizzes: async (params) => {
    const response = await api.get('/quizzes', { params });
    return response?.data ?? response ?? [];
  },
  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response?.data ?? response;
  },
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  publishQuiz: (id, data) => api.post(`/quizzes/${id}/publish`, data),
};

export const subjectService = {
  getSubjects: async () => {
    const response = await api.get('/subjects');
    return response?.data ?? response ?? [];
  },
};

export const classService = {
  getTeacherClasses: async (teacherId, params = {}) => {
    const response = await api.get(`/classes/teacher/${teacherId}`, { params });
    return response?.data ?? response ?? [];
  },
  getClassMembers: async (classId, params) => {
    const response = await api.get(`/classes/${classId}/members`, { params });
    return response?.data ?? response ?? {};
  },
  // Giáo viên lấy danh sách kết quả học sinh
  getTeacherAttempts: (params) => api.get('/quiz-attempts/teacher', { params }),
};

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response?.data ?? response ?? [];
  },

  // Đánh dấu đã đọc (nếu có)
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response?.data ?? response;
  },
};


export const quizAttemptService = {
  startQuizAttempt: (quizId) => api.post(`/quiz-attempts/start/${quizId}`),
  saveAnswer: (attemptId, data) => api.post(`/quiz-attempts/${attemptId}/answer`, data),
  submitQuiz: (attemptId) => api.post(`/quiz-attempts/${attemptId}/submit`),
  getAttemptResult: (attemptId) => api.get(`/quiz-attempts/${attemptId}/result`),
  getStudentAttempts: (params) => api.get('/quiz-attempts', { params }),
};

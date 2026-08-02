import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  updateSettings: (data) => api.put('/auth/settings', data),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  },
};

export const questionService = {
  createQuestion: (data)     => api.post('/questions', data),
  getQuestions:   async (params)   => {
    const response = await api.get('/questions', { params });
    return response?.data ?? response ?? [];
  },
  getQuestion:    async (id)       => {
    const response = await api.get(`/questions/${id}`);
    return response?.data ?? response;
  },
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id)       => api.delete(`/questions/${id}`),
  getCategories:  async ()         => {
    const response = await api.get('/questions/categories');
    return response?.data ?? response;
  },
};

export const quizService = {
  createQuiz:  async (data)     => {
    const response = await api.post('/quizzes', data);
    return response?.data ?? response;
  },
  getQuizzes:  async (params)   => {
    const response = await api.get('/quizzes', { params });
    return response?.data ?? response ?? [];
  },
  getQuiz:     async (id)       => {
    const response = await api.get(`/quizzes/${id}`);
    return response?.data ?? response;
  },
  updateQuiz:  (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz:  (id)       => api.delete(`/quizzes/${id}`),
  publishQuiz: (id)       => api.post(`/quizzes/${id}/publish`),
};

export const subjectService = {
  getSubjects: async () => {
    const response = await api.get('/subjects');
    // api interceptor trả về response.data rồi, nên response chính là body
    const body = response ?? {};
    return Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
  },
};

export const classService = {
  getTeacherClasses: async (teacherId) => {
    const response = await api.get(`/classes/teacher/${teacherId}`);
    const body = response ?? {};
    return Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
  },
  getStudentClasses: async () => {
    const response = await api.get('/classes/student');
    const body = response ?? {};
    return Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
  },
};

export const quizAttemptService = {
  startQuizAttempt:  (quizId)       => api.post(`/quiz-attempts/start/${quizId}`),
  saveAnswer:        (attemptId, data) => api.post(`/quiz-attempts/${attemptId}/answer`, data),
  submitQuiz:        (attemptId)    => api.post(`/quiz-attempts/${attemptId}/submit`),
  getAttemptResult:  (attemptId)    => api.get(`/quiz-attempts/${attemptId}/result`),
  getStudentAttempts:(params)       => api.get('/quiz-attempts', { params }),
  getTeacherAttempts:(params)       => api.get('/quiz-attempts/teacher', { params }),
};

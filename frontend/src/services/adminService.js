import api from './api';

// ==================== Users ====================
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const createUser = (data) => api.post('/admin/users', data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const toggleLockUser = (id) => api.patch(`/admin/users/${id}/toggle-lock`);

// ==================== Subjects ====================
export const getSubjects = (params) => api.get('/admin/subjects', { params });
export const getSubjectById = (id) => api.get(`/admin/subjects/${id}`);
export const createSubject = (data) => api.post('/admin/subjects', data);
export const updateSubject = (id, data) => api.put(`/admin/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/admin/subjects/${id}`);

// ==================== Classes ====================
export const getClasses = (params) => api.get('/admin/classes', { params });
export const getClassById = (id) => api.get(`/admin/classes/${id}`);
export const createClass = (data) => api.post('/admin/classes', data);
export const updateClass = (id, data) => api.put(`/admin/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/admin/classes/${id}`);
export const addStudentToClass = (classId, studentId) =>
  api.post(`/admin/classes/${classId}/students`, { studentId });
export const removeStudentFromClass = (classId, studentId) =>
  api.delete(`/admin/classes/${classId}/students/${studentId}`);

// ==================== Notifications ====================
export const getNotifications = (params) => api.get('/admin/notifications', { params });
export const getNotificationById = (id) => api.get(`/admin/notifications/${id}`);
export const createNotification = (data) => api.post('/admin/notifications', data);
export const updateNotification = (id, data) => api.put(`/admin/notifications/${id}`, data);
export const deleteNotification = (id) => api.delete(`/admin/notifications/${id}`);
export const togglePinNotification = (id) => api.patch(`/admin/notifications/${id}/toggle-pin`);

// ==================== Dashboard ====================
export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const getChartData = (params) => api.get('/admin/dashboard/chart', { params });
export const getRoleDistribution = () => api.get('/admin/dashboard/role-distribution');
export const getRecentActivities = (params) => api.get('/admin/dashboard/recent-activities', { params });

// ==================== Settings ====================
export const getSettings = () => api.get('/admin/settings');
export const updateSettings = (data) => api.put('/admin/settings', data);
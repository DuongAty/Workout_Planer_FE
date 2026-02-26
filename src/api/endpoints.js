import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('v1/auth/register', data),
  login: (data) => axiosClient.post('v1/auth/login', data),
  getMe: () => axiosClient.get('v1/auth/me'),
  logout: () => axiosClient.post('v1/auth/logout'),
  refresh: (token) => axiosClient.post('v1/auth/refresh', { refreshToken: token }),
  updateProfile: (id, data) => axiosClient.patch(`v1/auth/${id}/update-user`, data),
uploadAvatar: (id, formData) => {
  return axiosClient.post(`v1/auth/${id}/upload-avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
};

export const workoutApi = {
  getAll: (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
    );
    return axiosClient.get('v1/workoutplans', { params: cleanParams });
  },
  getOne: (id) => axiosClient.get(`v1/workoutplans/${id}`),
  create: (data) => axiosClient.post('v1/workoutplans', data),
  update: (id, data) => axiosClient.patch(`v1/workoutplans/${id}`, data),
  delete: (id) => axiosClient.delete(`v1/workoutplans/${id}`),
  getExercises: (id, params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
    );
    return axiosClient.get(`v1/workoutplans/${id}/exercises`, { params: cleanParams });
  },
  updateItemStatus: (id, data) => axiosClient.patch(`v1/workoutplans/${id}/item-status`, data),
  rescheduleItem: (id, data) => axiosClient.patch(`v1/workoutplans/${id}/reschedule-item`, data),
  checkAllAutoMissed: () => axiosClient.patch(`v1/workoutplans/check-missed-all`),
  createByAi: (message)=> axiosClient.post(`v1/workoutplans/ai`, message)
};

export const exerciseApi = {
  create: (workoutId, data) => axiosClient.post(`v1/exercises/${workoutId}`, data),
  update: (id, data) => axiosClient.patch(`v1/exercises/${id}`, data),
  delete: (id) => axiosClient.delete(`v1/exercises/${id}`),
  uploadMedia: (id, file, type = 'video') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', type);
      return axiosClient.post(`v1/exercises/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
};

export const measurementApi = {
  create: (data) => axiosClient.post('/body-measurements', data),
    getChartData: (muscleGroup, startDate, endDate) => 
    axiosClient.get('/body-measurements/chart', { params: { key: muscleGroup, startDate, endDate } }),
    getLatestProgress: (muscleGroup) => 
    axiosClient.get('/body-measurements/progress', { params: { key: muscleGroup } })
};

export const stepOfExerciseApi = {
  saveMany: (exerciseId, steps) => {
    return axiosClient.patch(`/steps-of-exercise/exercise/${exerciseId}/steps`, { steps });
  },
  getByExercise: (exerciseId) => {
    return axiosClient.get(`steps-of-exercise/exercise/${exerciseId}`);
  },
  delete: (id) => {
    return axiosClient.delete(`steps-of-exercise/${id}`);
  }
};

export const nutritionApi = { 
  getDailySummary: (date) => axiosClient.get(`/nutrition/daily-summary${date ? `?date=${date}` : ''}`),
  logMeal: (mealText) => axiosClient.post('nutrition/log', { meal: mealText  })
};

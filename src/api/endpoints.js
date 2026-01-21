import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('v1/auth/register', data), // fullname, username, password
  login: (data) => axiosClient.post('v1/auth/login', data),
  getMe: () => axiosClient.get('v1/auth/me'),
  logout: () => axiosClient.post('v1/auth/logout'),
  refresh: (token) => axiosClient.post('v1/auth/refresh', { refreshToken: token }), //
};

export const workoutApi = {
  getAll: (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
    );
    return axiosClient.get('v1/workoutplans', { params: cleanParams });
  },
  getOne: (id) => axiosClient.get(`v1/workoutplans/${id}`),
  create: (data) => axiosClient.post('v1/workoutplans', data), // name
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
};

export const exerciseApi = {
  create: (workoutId, data) => axiosClient.post(`v1/exercises/${workoutId}`, data),
  update: (id, data) => axiosClient.patch(`v1/exercises/${id}`, data),
  delete: (id) => axiosClient.delete(`v1/exercises/${id}`),
  uploadMedia: (id, file, type = 'video') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', type); // Backend yêu cầu trường này

      return axiosClient.post(`v1/exercises/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
};
export const measurementApi = {
  // @Post() create
  create: (data) => axiosClient.post('/body-measurements', data),
    getChartData: (muscleGroup, startDate, endDate) => 
    axiosClient.get('/body-measurements/chart', { params: { key: muscleGroup, startDate, endDate } }),
    getLatestProgress: (muscleGroup) => 
    axiosClient.get('/body-measurements/progress', { params: { key: muscleGroup } })
};

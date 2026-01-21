export const DEBOUNCE_DELAY = 400;
export const INITIAL_FILTERS = {
  search: '',
  numExercises: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 3
};

export const formatDate = (date) => {
  if (!date) return "--/--/----";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "--/--/----" : d.toLocaleDateString('vi-VN');
};
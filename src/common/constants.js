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
export const MUSCLE_GROUPS = ["Ngực", "Lưng", "Tay", "Vai", "Chân", "Mông", "Bụng"];

  export const formatTime = (seconds) => {
  if (seconds <= 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 
    ? `${minutes}:${remainingSeconds}s` 
    : `${minutes}m`;
};
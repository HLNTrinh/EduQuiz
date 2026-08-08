export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
};

// Định dạng thời gian làm bài (ms) → "X phút Y giây" / "Y giây" / "H giờ X phút"
export const formatDuration = (ms) => {
  if (!ms || Number.isNaN(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return secs > 0 ? `${hours} giờ ${minutes} phút ${secs} giây` : `${hours} giờ ${minutes} phút`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes} phút ${secs} giây` : `${minutes} phút`;
  }
  return `${secs} giây`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

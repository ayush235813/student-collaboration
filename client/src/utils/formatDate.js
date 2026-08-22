// Format a date string or Date object into a readable format
// Usage: formatDate('2024-01-15T10:30:00Z') → "Jan 15, 2024"
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
// Usage: formatDateTime('2024-01-15T10:30:00Z') → "Jan 15, 2024, 10:30 AM"
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

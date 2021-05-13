export const cleanTimestamp = (timestamp) => timestamp.replace('T', ' ').replace('Z', ' ');

export const cropStringWithEllipsis = (text, lengthWithEllipsis) => {
  if (!text || text.length === '') return 'N/A';

  return text.length > lengthWithEllipsis
    ? `${text.substring(0, lengthWithEllipsis - 3)}\u2026`
    : text;
};

export const cleanBytesString = (bytes, decimals = 2) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes || bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const convertDateToUtc = (date) => {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate;
};

export const convertDateFromUtc = (utcDate) => {
  const dateObj = new Date();
  const date = new Date(utcDate.getTime() - dateObj.getTimezoneOffset() * 60000);
  return date;
};

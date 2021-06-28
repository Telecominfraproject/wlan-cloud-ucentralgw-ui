export const cleanTimestamp = (timestamp) => timestamp.replace('T', ' ').replace('Z', ' ');

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

export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

const prettyNumber = (number) => {
  if (number >= 10) {
    return number;
  }
  return `0${number}`;
};

const unixToDateString = (unixNumber) => unixNumber * 1000;

export const prettyDate = (dateString) => {
  const convertedTimestamp = unixToDateString(dateString);
  const date = new Date(convertedTimestamp);
  return `${date.getFullYear()}-${prettyNumber(date.getMonth() + 1)}-${prettyNumber(date.getDate())}
  ${prettyNumber(date.getHours())}:${prettyNumber(date.getMinutes())}:${prettyNumber(
    date.getSeconds(),
  )}`;
};

export const unixToTime = (dateString) => {
  const convertedTimestamp = unixToDateString(dateString);
  const date = new Date(convertedTimestamp);
  return `${prettyNumber(date.getHours())}:${prettyNumber(date.getMinutes())}:${prettyNumber(
    date.getSeconds(),
  )}`;
};

export const dateToUnix = (date) => Math.floor(new Date(date).getTime() / 1000);

export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const checkIfJson = (string) => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
};

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
export const prettyDateForFile = (dateString) => {
  const convertedTimestamp = unixToDateString(dateString);
  const date = new Date(convertedTimestamp);
  return `${date.getFullYear()}_${prettyNumber(date.getMonth() + 1)}_${prettyNumber(
    date.getDate(),
  )}_${prettyNumber(date.getHours())}h${prettyNumber(date.getMinutes())}m${prettyNumber(
    date.getSeconds(),
  )}s`;
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

export const secondsToDetailed = (
  seconds,
  dayLabel,
  daysLabel,
  hourLabel,
  hoursLabel,
  minuteLabel,
  minutesLabel,
  secondLabel,
  secondsLabel,
) => {
  if (!seconds || seconds === 0) return `0 ${secondsLabel}`;
  let secondsLeft = seconds;
  const days = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= days * (3600 * 24);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft -= hours * 3600;
  const minutes = Math.floor(secondsLeft / 60);
  secondsLeft -= minutes * 60;

  let finalString = '';

  if (days > 0)
    finalString =
      days === 1 ? `${finalString}${days} ${dayLabel}, ` : `${finalString}${days} ${daysLabel}, `;
  if (hours > 0)
    finalString =
      hours === 1
        ? `${finalString}${hours} ${hourLabel}, `
        : `${finalString}${hours} ${hoursLabel}, `;
  if (minutes > 0)
    finalString =
      minutes === 1
        ? `${finalString}${minutes} ${minuteLabel}, `
        : `${finalString}${minutes} ${minutesLabel}, `;
  if (secondsLeft > 0)
    finalString =
      secondsLeft === 1
        ? `${finalString}${secondsLeft} ${secondLabel}`
        : `${finalString}${secondsLeft} ${secondsLabel}`;

  return finalString;
};

export const compactSecondsToDetailed = (seconds, dayLabel, daysLabel, secondsLabel) => {
  if (!seconds || seconds === 0) return `0 ${secondsLabel}`;
  let secondsLeft = seconds;
  const days = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= days * (3600 * 24);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft -= hours * 3600;
  const minutes = Math.floor(secondsLeft / 60);
  secondsLeft -= minutes * 60;

  let finalString = '';

  finalString =
    days === 1 ? `${finalString}${days} ${dayLabel}, ` : `${finalString}${days} ${daysLabel}, `;
  finalString = `${finalString}${prettyNumber(hours)}:`;
  finalString = `${finalString}${prettyNumber(minutes)}:`;
  finalString = `${finalString}${prettyNumber(secondsLeft)}`;

  return finalString;
};

export const validateEmail = (email) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

export const testRegex = (value, regexString) => {
  const regex = new RegExp(regexString);
  return regex.test(value);
};

export const datesSameDay = (first, second) => first.getDate() === second.getDate();

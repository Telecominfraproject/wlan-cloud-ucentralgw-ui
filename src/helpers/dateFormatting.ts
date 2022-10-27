const UNITS: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const RTF = new Intl.RelativeTimeFormat('en', { localeMatcher: 'best fit', style: 'long' });

const twoDigitNumber = (number: number) => {
  if (number >= 10) {
    return number;
  }
  return `0${number}`;
};

const unixToDateString = (unixNumber: number) => unixNumber * 1000;

export const compactDate = (dateString: number) => {
  if (!dateString || dateString === null) return '-';
  const convertedTimestamp = unixToDateString(dateString);
  const date = new Date(convertedTimestamp);
  return `${date.getFullYear()}-${twoDigitNumber(date.getMonth() + 1)}-${twoDigitNumber(date.getDate())}
  ${twoDigitNumber(date.getHours())}:${twoDigitNumber(date.getMinutes())}:${twoDigitNumber(date.getSeconds())}`;
};

export const formatDaysAgo = (d1: number, d2: number = new Date().getTime()) => {
  try {
    const convertedTimestamp = unixToDateString(d1);
    const date = new Date(convertedTimestamp).getTime();
    const elapsed = date - d2;

    for (const key of Object.keys(UNITS))
      if (Math.abs(elapsed) > UNITS[key as 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'] || key === 'second')
        return RTF.format(
          Math.round(elapsed / UNITS[key as 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second']),
          key as Intl.RelativeTimeFormatUnit,
        );

    return compactDate(date);
  } catch {
    return '-';
  }
};

export const compactSecondsToDetailed = (seconds: number, t: (str: string) => string) => {
  if (!seconds || seconds === 0) return `0 ${t('common.seconds')}`;
  let secondsLeft = seconds;
  const days = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= days * (3600 * 24);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft -= hours * 3600;
  const minutes = Math.floor(secondsLeft / 60);
  secondsLeft -= minutes * 60;

  let finalString = '';

  finalString =
    days === 1 ? `${finalString}${days} ${t('common.day')}, ` : `${finalString}${days} ${t('common.days')}, `;
  finalString = `${finalString}${twoDigitNumber(hours)}:`;
  finalString = `${finalString}${twoDigitNumber(minutes)}:`;
  finalString = `${finalString}${twoDigitNumber(secondsLeft)}`;

  return finalString;
};

export const secondsDuration = (seconds: number, t: (str: string) => string) => {
  if (!seconds || seconds === 0) return `0 ${t('common.seconds')}`;
  let secondsLeft = seconds;
  const days = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= days * (3600 * 24);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft -= hours * 3600;
  const minutes = Math.floor(secondsLeft / 60);
  secondsLeft -= minutes * 60;

  let finalString = '';

  finalString = `${finalString}${twoDigitNumber(days)}d`;
  finalString = `${finalString}${twoDigitNumber(hours)}h`;
  finalString = `${finalString}${twoDigitNumber(minutes)}m`;
  finalString = `${finalString}${twoDigitNumber(secondsLeft)}s`;

  return finalString;
};

export const minimalSecondsToDetailed = (seconds: number, t: (str: string) => string) => {
  if (!seconds || seconds === 0) return `0 ${t('common.seconds')}`;
  let secondsLeft = seconds;
  const days = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= days * (3600 * 24);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft -= hours * 3600;
  const minutes = Math.floor(secondsLeft / 60);
  secondsLeft -= minutes * 60;

  let finalString = '';

  finalString = `${finalString}${twoDigitNumber(days)}:`;
  finalString = `${finalString}${twoDigitNumber(hours)}:`;
  finalString = `${finalString}${twoDigitNumber(minutes)}:`;
  finalString = `${finalString}${twoDigitNumber(secondsLeft)}`;

  return finalString;
};

export const getHoursAgo = (hoursAgo = 1, date = new Date()) => {
  const newDate = new Date(date.getTime());
  newDate.setHours(date.getHours() - hoursAgo);
  return newDate;
};

export const dateForFilename = (dateString: number) => {
  const convertedTimestamp = unixToDateString(dateString);
  const date = new Date(convertedTimestamp);
  return `${date.getFullYear()}_${twoDigitNumber(date.getMonth() + 1)}_${twoDigitNumber(
    date.getDate(),
  )}_${twoDigitNumber(date.getHours())}h${twoDigitNumber(date.getMinutes())}m${twoDigitNumber(date.getSeconds())}s`;
};

const COLOMBIA_UTC_OFFSET = 5;

export const addDays = (date, days) => {
  const newDate = new Date(date); // Create a new Date object to avoid mutating the original date
  newDate.setDate(newDate.getDate() + days); // Add the specified number of days
  return newDate;
}

export const getTodayPlusTime = (date = [0, 0, 0], time = [0, 0, 0, 0]) => {
  // Get the current date (UTC)
  const now = new Date();

  // Adjust to local time zone by subtracting the offset (UTC-5)
  now.setHours(now.getHours() - COLOMBIA_UTC_OFFSET);

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const nowDate = now.getUTCDate();

  // Create start of the day in local time
  const startOfDayLocal = new Date(Date.UTC(nowYear + date[0], nowMonth + date[1], nowDate + date[2], ...time));

  // Adjust to UTC again by adding the offset
  startOfDayLocal.setHours(startOfDayLocal.getHours() + COLOMBIA_UTC_OFFSET);

  return startOfDayLocal;
};

export const getTodayAtMidnight = () => {
  return getTodayPlusTime();
};

export const getTomorrowAtMidnight = () => {
  return getTodayPlusTime(undefined,[23, 59, 59, 999]);
};

export const getRangeForToday = () => {
  return [
    getTodayAtMidnight(),
    getTomorrowAtMidnight(),
  ];
};

export const getAYearFromToday = () => {
    return getTodayPlusTime([1, 0, 0])
};

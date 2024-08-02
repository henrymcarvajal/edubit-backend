const COLOMBIA_UTC_OFFSET = 5;

export const addDays = (date, days) => {
  const newDate = new Date(date); // Create a new Date object to avoid mutating the original date
  newDate.setDate(newDate.getDate() + days); // Add the specified number of days
  return newDate;
}

export const getTodayPlusTime = (date = [0, 0, 0], time = [0, 0, 0, 0]) => {
  // Get the current date (UTC)
  const now = new Date();

  console.log('Local', now.getFullYear(),   now.getMonth(),  now.getDate())
  console.log('UTC', now.getUTCFullYear(),  now.getUTCMonth(),  now.getUTCDate())

  // Adjust to local time zone by subtracting the offset (UTC-5)
  now.setHours(now.getHours() - COLOMBIA_UTC_OFFSET);

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const nowDate = now.getUTCDate();

  console.log('now local', nowYear,   nowMonth,  nowDate)
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate = now.getDate();
  console.log('now UTC', localYear,  localMonth,  localDate)

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

const getRangeForToday2 = () => {

  // Get the current date in local time (UTC-5)
  const now = new Date();
  const localYear = now.getUTCFullYear();
  const localMonth = now.getUTCMonth();
  const localDate = now.getUTCDate();

  // Create start and end of the day in local time
  const startOfDayLocal = new Date(Date.UTC(localYear, localMonth, localDate, 0, 0, 0));
  const endOfDayLocal = new Date(Date.UTC(localYear, localMonth, localDate, 23, 59, 59, 999));

  // Adjust to UTC by adding the offset
  startOfDayLocal.setHours(startOfDayLocal.getHours() + COLOMBIA_UTC_OFFSET);
  endOfDayLocal.setHours(endOfDayLocal.getHours() + COLOMBIA_UTC_OFFSET);

  console.log(startOfDayLocal.toISOString());
  console.log(endOfDayLocal.toISOString());

  return [
    startOfDayLocal.toISOString(),
    endOfDayLocal.toISOString(),
  ];
};
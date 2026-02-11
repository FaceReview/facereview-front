export * from './emotion';

export const getTimeToString = (time: string) => {
  const currentDate = new Date();
  const date = new Date(time + 'Z');

  const timeDiff = currentDate.getTime() - date.getTime();
  const timeDiffSec = timeDiff / 1000;

  const yearDiff = new Date(timeDiff).getFullYear() - 1970;
  const monthDiff =
    currentDate.getMonth() -
    date.getMonth() +
    12 * (currentDate.getFullYear() - date.getFullYear());
  const dateDiff = Math.floor(timeDiffSec / (60 * 60 * 24));
  const hourDiff = Math.floor(timeDiffSec / (60 * 60));
  const minuteDiff = Math.floor(timeDiffSec / 60);

  if (yearDiff) {
    return yearDiff + '년 전';
  }
  if (monthDiff) {
    return monthDiff + '달 전';
  }
  if (dateDiff) {
    return dateDiff + '일 전';
  }
  if (hourDiff) {
    return hourDiff + '시간 전';
  }
  return minuteDiff + '분 전';
};

export const getTimeArrFromDuration = (duration: string) => {
  let temp = duration.slice(2);
  let hour = 0,
    minute = 0,
    second = 0;

  const hourSplit = temp.split('H');
  if (hourSplit.length !== 1) {
    hour = +hourSplit[0];
    temp = hourSplit[1];
  }

  const minuteSplit = temp.split('M');
  if (minuteSplit.length !== 1) {
    minute = +minuteSplit[0];
    temp = minuteSplit[1];
  }

  second = +temp.slice(0, -1);

  return [hour, minute, second];
};

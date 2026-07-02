export * from './emotion';

export const getTimeToString = (time: string): string => {
  const currentDate = new Date();
  const date = new Date(time.endsWith('Z') ? time : `${time}Z`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

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

const ISO_DURATION_PATTERN = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

/**
 * Parses an ISO 8601 duration (e.g. "PT1H2M3S") into a tuple [hour, minute, second].
 * Returns [0, 0, 0] when the input cannot be parsed.
 */
export const getTimeArrFromDuration = (
  duration: string,
): [number, number, number] => {
  const match = ISO_DURATION_PATTERN.exec(duration);
  if (!match) return [0, 0, 0];

  const hour = match[1] ? parseInt(match[1], 10) : 0;
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const second = match[3] ? parseInt(match[3], 10) : 0;

  return [hour, minute, second];
};

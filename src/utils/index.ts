import { EmotionType, VideoDistributionDataType } from 'types/index';

export const labelOfEmotion = {
  happy: '즐거운',
  surprise: '놀라운',
  sad: '슬픈',
  angry: '화나는',
  neutral: '평온한',
};

export const emojiOfEmotion = {
  happy: '😄',
  surprise: '😲',
  sad: '😥',
  angry: '😠',
  neutral: '😐',
};

export const mapEmotionToNumber = (prop: EmotionType) => {
  switch (prop) {
    case 'neutral':
      return 0;
    case 'happy':
      return 1;
    case 'surprise':
      return 2;
    case 'sad':
      return 3;
    case 'angry':
      return 4;
    default:
      return 0;
  }
};

export const mapNumberToEmotion = (prop: number) => {
  switch (prop) {
    case 0:
      return 'neutral';
    case 1:
      return 'happy';
    case 2:
      return 'surprise';
    case 3:
      return 'sad';
    case 4:
      return 'angry';
    default:
      return 'neutral';
  }
};

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

export const getDistributionToGraphData = (dist: VideoDistributionDataType) => {
  console.log('getDistributionToGraphData', dist);
  const temp: { [key in EmotionType]: { x: string; y: number }[] } = {
    neutral: [],
    happy: [],
    sad: [],
    surprise: [],
    angry: [],
  };

  for (let i = 1; i < dist.happy.length; i += 2) {
    temp.happy.push({
      x: dist.happy[i].x + '',
      y: (dist.happy[i].y + dist.happy[i - 1].y) / 2,
    });
    temp.sad.push({
      x: dist.sad[i].x + '',
      y: (dist.sad[i].y + dist.sad[i - 1].y) / 2,
    });
    temp.surprise.push({
      x: dist.surprise[i].x + '',
      y: (dist.surprise[i].y + dist.surprise[i - 1].y) / 2,
    });
    temp.angry.push({
      x: dist.angry[i].x + '',
      y: (dist.angry[i].y + dist.angry[i - 1].y) / 2,
    });
  }
  console.log(temp);

  // const res = [
  //   {
  //     id: "happy",
  //     data: temp.happy,
  //   },
  //   {
  //     id: "sad",
  //     data: temp.sad,
  //   },
  //   {
  //     id: "surprise",
  //     data: temp.surprise,
  //   },
  //   {
  //     id: "angry",
  //     data: temp.angry,
  //   },
  //   {
  //     id: "neutral",
  //     data: temp.neutral,
  //   },
  // ];
  // console.log(res);
  const res = [
    {
      id: 'happy',
      data: dist.happy,
    },
    {
      id: 'sad',
      data: dist.sad,
    },
    {
      id: 'surprise',
      data: dist.surprise,
    },
    {
      id: 'angry',
      data: dist.angry,
    },
    {
      id: 'neutral',
      data: dist.neutral,
    },
  ];
  console.log(res);

  return res;
};

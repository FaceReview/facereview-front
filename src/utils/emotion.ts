import { EMOTION_EMOJIS, EMOTION_LABELS, EMOTIONS } from 'constants/index';
import {
  EmotionType,
  GraphDistributionDataType,
  VideoDistributionDataType,
} from 'types/index';

export const labelOfEmotion = EMOTION_LABELS;

export const emojiOfEmotion = EMOTION_EMOJIS;

export const mapEmotionToNumber = (emotion: EmotionType): number => {
  const mapping: Record<EmotionType, number> = {
    neutral: 0,
    happy: 1,
    surprise: 2,
    sad: 3,
    angry: 4,
  };
  return mapping[emotion] ?? 0;
};

export const mapNumberToEmotion = (num: number): EmotionType => {
  const mapping: Record<number, EmotionType> = {
    0: 'neutral',
    1: 'happy',
    2: 'surprise',
    3: 'sad',
    4: 'angry',
  };
  return mapping[num] ?? 'neutral';
};

export const getDistributionToGraphData = (
  dist: VideoDistributionDataType,
): GraphDistributionDataType[] => {
  if (!dist) return [];

  const temp: { [key in EmotionType]: { x: string | number; y: number }[] } = {
    neutral: [],
    happy: [],
    sad: [],
    surprise: [],
    angry: [],
  };

  EMOTIONS.forEach((emotion) => {
    if (dist[emotion] && Array.isArray(dist[emotion])) {
      for (let i = 1; i < dist[emotion].length; i += 2) {
        const curr = dist[emotion][i];
        const prev = dist[emotion][i - 1];
        if (curr && prev) {
          const xVal =
            curr.x !== undefined && curr.x !== null ? Number(curr.x) : null;
          const y1 = typeof curr.y === 'number' ? curr.y : 0;
          const y2 = typeof prev.y === 'number' ? prev.y : 0;

          if (xVal !== null && !isNaN(xVal)) {
            temp[emotion].push({
              x: xVal,
              y: (y1 + y2) / 2 || 0, // Prevent NaN
            });
          }
        }
      }
    }
  });

  return EMOTIONS.map((emotion) => ({
    id: emotion,
    data: temp[emotion],
  }));
};

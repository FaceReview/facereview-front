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
  return EMOTIONS.map((emotion) => {
    const rawPoints = Array.isArray(dist[emotion]) ? dist[emotion] : [];
    const pointMap = new Map<number, { total: number; count: number }>();

    rawPoints.forEach((point) => {
      const x =
        typeof point?.x === 'number' ? point.x : Number(point?.x ?? NaN);
      const y =
        typeof point?.y === 'number' ? point.y : Number(point?.y ?? NaN);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }

      const prev = pointMap.get(x);

      if (prev) {
        pointMap.set(x, {
          total: prev.total + y,
          count: prev.count + 1,
        });
        return;
      }

      pointMap.set(x, { total: y, count: 1 });
    });

    const data = Array.from(pointMap.entries())
      .sort(([xA], [xB]) => xA - xB)
      .map(([x, value]) => ({
        x,
        y: value.total / value.count,
      }));

    return {
      id: emotion,
      data,
    };
  });
};

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

export type ScaledGraphDistributionDataType = {
  id: EmotionType;
  data: { x: number; y: number }[];
};

export const getScaledTimelineGraphData = (
  dist: VideoDistributionDataType,
  duration = 100,
): ScaledGraphDistributionDataType[] => {
  const graphData = getDistributionToGraphData(dist).filter(
    (series) => series.data.length > 0,
  );

  if (graphData.length === 0) {
    return [];
  }

  const graphDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 100;
  const allXValues = graphData.flatMap((series) =>
    series.data
      .map((point) =>
        typeof point.x === 'number' ? point.x : Number(point.x),
      )
      .filter((x) => Number.isFinite(x)),
  );

  if (allXValues.length === 0) {
    return [];
  }

  const minGraphX = Math.min(...allXValues);
  const maxGraphX = Math.max(...allXValues);
  const hasXRange = maxGraphX > minGraphX;

  return graphData.map((series) => {
    let newData = series.data
      .map((point) => {
        const pointX =
          typeof point.x === 'number' ? point.x : Number(point.x);
        const rawX = Number.isFinite(pointX) ? pointX : minGraphX;
        const scaledX = hasXRange
          ? ((rawX - minGraphX) / (maxGraphX - minGraphX)) * graphDuration
          : 0;

        return {
          x: Math.min(Math.max(scaledX, 0), graphDuration),
          y: point.y,
        };
      })
      .sort((a, b) => a.x - b.x);

    if (newData.length === 0) {
      newData = [{ x: 0, y: 0 }];
    } else {
      const firstPoint = newData[0];
      const lastPoint = newData[newData.length - 1];

      if (firstPoint.x !== 0) {
        newData = [{ x: 0, y: firstPoint.y }, ...newData];
      } else {
        newData[0] = { x: 0, y: firstPoint.y };
      }

      if (lastPoint.x !== graphDuration) {
        newData = [...newData, { x: graphDuration, y: lastPoint.y }];
      }
    }

    return {
      ...series,
      data: newData,
    };
  });
};

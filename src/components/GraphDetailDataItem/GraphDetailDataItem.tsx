import React from 'react';
import EmotionBadge from 'components/EmotionBadge/EmotionBadge';
import { EmotionType } from 'types';

type EmotionDatum = { id?: string } & Partial<Record<EmotionType, number>>;

type GraphDetailDataItemProps = {
  graphData: EmotionDatum[];
  emotion: EmotionType;
  emotionText: string;
  mostEmotion: EmotionType;
};

const GraphDetailDataItem = React.memo(
  ({ graphData, emotion, emotionText, mostEmotion }: GraphDetailDataItemProps) => {
    const value = graphData[0]?.[emotion];
    return (
      <div
        className={`graph-detail-item ${
          emotion === mostEmotion ? 'active' : ''
        }`}>
        <EmotionBadge type={'big'} emotion={emotion} />

        <p className="font-label-medium emotion-text">{emotionText}</p>
        <p className="font-label-medium emotion-percentage">
          {value != null ? `${value}%` : '-'}
        </p>
      </div>
    );
  },
);

GraphDetailDataItem.displayName = 'GraphDetailDataItem';

export default GraphDetailDataItem;

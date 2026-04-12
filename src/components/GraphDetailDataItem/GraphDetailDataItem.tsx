import React from 'react';
import EmotionBadge from 'components/EmotionBadge/EmotionBadge';
import { EmotionType } from 'types';

type GraphDetailDataItemProps = {
  graphData: Record<string, string | number>[];
  emotion: EmotionType;
  emotionText: string;
  mostEmotion: EmotionType;
};

const GraphDetailDataItem = React.memo(
  ({ graphData, emotion, emotionText, mostEmotion }: GraphDetailDataItemProps) => {
    return (
      <div
        className={`graph-detail-item ${
          emotion === mostEmotion ? 'active' : null
        }`}>
        <EmotionBadge type={'big'} emotion={emotion} />

        <p className="font-label-medium emotion-text">{emotionText}</p>
        <p className="font-label-medium emotion-percentage">
          {'' + graphData[0][emotion] + '%'}
        </p>
      </div>
    );
  },
);

GraphDetailDataItem.displayName = 'GraphDetailDataItem';

export default GraphDetailDataItem;

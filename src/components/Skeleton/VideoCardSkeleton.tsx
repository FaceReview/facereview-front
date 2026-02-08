import { ReactElement } from 'react';
import './videocardskeleton.scss';

type VideoCardSkeletonProps = {
  width?: number;
  style?: React.CSSProperties;
};

const VideoCardSkeleton = ({
  width,
  style,
}: VideoCardSkeletonProps): ReactElement => {
  const finalWidth = width ? width : 280;
  const height = finalWidth * (9 / 16);

  return (
    <div
      className="video-card-skeleton"
      style={{ ...style, width: `${finalWidth}px` }}>
      <div
        className="thumbnail-skeleton"
        style={{ width: finalWidth, height: height }}></div>
      <div className="info-skeleton">
        <div className="title-skeleton"></div>
        <div className="meta-skeleton">
          <div className="circle-skeleton"></div>
          <div className="text-skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;

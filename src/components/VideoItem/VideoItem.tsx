import { ReactElement, useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { EmotionType } from 'types';
import { emojiOfEmotion, labelOfEmotion } from 'utils';
import { YouTubePlayer } from 'youtube-player/dist/types';
import './videoitem.scss';

type VideoItemPropsType = {
  type: 'small-emoji' | 'big-emoji';
  videoId: string; // This is the YouTube ID
  videoUuid: string; // This is the internal UUID for navigation
  videoTitle: string;
  videoMostEmotion: EmotionType;
  videoMostEmotionPercentage: number;
  width?: number;
  style?: React.CSSProperties;
  hoverToPlay?: boolean;
  priority?: boolean;
};

const VideoItem = memo(
  ({
    type,
    videoId,
    videoUuid,
    videoTitle,
    videoMostEmotion,
    videoMostEmotionPercentage,
    width,
    style,
    hoverToPlay = true,
    priority = false,
  }: VideoItemPropsType): ReactElement => {
    const navigation = useNavigate();
    const height = width ? width * (9 / 16) : null;
    const opts = useMemo(
      () => ({
        width: width ? width : 280,
        height: height ? height : 158,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1 as const,
          color: 'white' as const,
          controls: 0 as const,
          disablekb: 0 as const,
          fs: 0 as const,
          rel: 0 as const,
          origin: window.location.origin,
        },
      }),
      [width, height],
    );
    const [video, setVideo] = useState<YouTubePlayer | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const parsedVideoId = useMemo(() => {
      if (videoId?.includes('v=')) {
        return videoId.split('v=')[1]?.split('&')[0] || videoId;
      } else if (videoId?.includes('youtu.be/')) {
        return videoId.split('youtu.be/')[1]?.split('?')[0] || videoId;
      }
      return videoId;
    }, [videoId]);

    const loadedVideoMostEmotion: string = videoMostEmotion as string;

    const handleClick = () => {
      navigation(`/watch/${videoUuid}`);
    };

    const handleVideoReady = (e: YouTubeEvent<YouTubePlayer>) => {
      e.target.mute();
      setVideo(e.target);
    };

    const handleMouseHover = () => {
      if (!hoverToPlay) return;
      setIsHovered(true);
      // iframe이 이미 마운트된 경우 소리 켜고 재생
      if (video?.isMuted()) {
        video?.unMute();
        video?.playVideo();
      }
    };
    const handleMouseOut = () => {
      if (!hoverToPlay) return;
      // hover 이탈 시 iframe 언마운트 → 네트워크 요청 완전 종료
      setIsHovered(false);
      setVideo(null);
    };

    return (
      <div
        className="video-item-container"
        style={{ ...style, width: `${width ? width : 280}px` }}
        onClick={handleClick}
        onMouseOver={handleMouseHover}
        onMouseOut={handleMouseOut}>
        <div
          className="thumbnail-wrapper"
          style={{ width: width ? width : 280, height: height ? height : 158 }}>
          <img
            className={`video-thumbnail ${hoverToPlay ? '' : 'fix'}`}
            width={width ? width : 280}
            height={height ? height : 158}
            src={`https://img.youtube.com/vi/${parsedVideoId}/mqdefault.jpg`}
            alt={videoTitle}
            loading={priority ? 'eager' : 'lazy'}
            {...(priority ? { fetchPriority: 'high' as const } : {})}
          />
          {hoverToPlay && isHovered ? (
            <YouTube
              videoId={parsedVideoId}
              iframeClassName={'youtube-item'}
              opts={opts}
              onReady={handleVideoReady}
            />
          ) : null}
        </div>
        <div className="video-info-container">
          <h3 className="video-title font-label-large">{videoTitle}</h3>
          {loadedVideoMostEmotion === 'None' ||
          videoMostEmotionPercentage === 0 ? (
            <h3 className="video-emotion-data-empty font-body-medium">
              아직 시청기록이 없어요.
            </h3>
          ) : (
            <div className="video-emotion-container">
              <div
                className={`video-emoji-container ${type} ${videoMostEmotion}`}>
                {emojiOfEmotion[videoMostEmotion]}
              </div>
              <h3 className="video-emotion-data font-body-medium">
                {labelOfEmotion[videoMostEmotion]}
                {type === 'big-emoji' ? <br /> : ` `}
                {videoMostEmotionPercentage}%
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  },
);

VideoItem.displayName = 'VideoItem';

export default VideoItem;

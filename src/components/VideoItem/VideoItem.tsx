import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import YouTube, { YouTubeEvent } from "react-youtube";
import { EmotionType } from "types";
import { emojiOfEmotion, labelOfEmotion } from "utils";
import { Options, YouTubePlayer } from "youtube-player/dist/types";
import "./videoitem.scss";

type VideoItemPropsType = {
  type: "small-emoji" | "big-emoji";
  videoId: string;
  videoTitle: string;
  videoMostEmotion: EmotionType;
  videoMostEmotionPercentage: number;
  width?: number;
  style?: React.CSSProperties;
};

const VideoItem = ({
  type,
  videoId,
  videoTitle,
  videoMostEmotion,
  videoMostEmotionPercentage,
  width,
  style,
}: VideoItemPropsType): ReactElement => {
  const navigation = useNavigate();
  const height = width ? width * (9 / 16) : null;
  const opts: Options = {
    width: width ? width : 280,
    height: height ? height : 158,
    playerVars: {
      autoplay: 1,
      color: "white",
      controls: 0,
      disablekb: 0,
      fs: 0,
      rel: 0,
    },
  };
  const [video, setVideo] = useState<YouTubePlayer | null>(null);

  const loadedVideoMostEmotion: string = videoMostEmotion as string;

  const handleClick = () => {
    navigation(`/watch/${videoId}`);
  };

  const handleVideoReady = (e: YouTubeEvent<any>) => {
    e.target.mute();
    setVideo(e.target);
  };

  const handleMouseHover = () => {
    if (video?.isMuted() && video?.playVideo) {
      video?.unMute();
      video?.playVideo();
    }
  };
  const handleMouseOut = () => {
    if (video?.isMuted && !video?.isMuted() && video?.stopVideo) {
      video?.mute();
      video?.stopVideo();
    }
  };

  return (
    <div
      className="video-item-container"
      style={{ ...style, width: `${width ? width : 280}px` }}
      onClick={handleClick}
      onMouseOver={handleMouseHover}
      onMouseOut={handleMouseOut}
    >
      <div
        className="thumbnail-wrapper"
        style={{ width: width ? width : 280, height: height ? height : 158 }}
      >
        <img
          className="video-thumbnail"
          style={{ width: width ? width : 280, height: height ? height : 158 }}
          src={`http://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt=""
        />
        {/* <YouTube
          videoId={videoId}
          // id={string} // defaults -> ''
          // className={string} // defaults -> ''
          iframeClassName={"youtube-item"} // defaults -> ''
          // style={object} // defaults -> {}
          // title={string} // defaults -> ''
          // loading={string} // defaults -> undefined
          opts={opts} // defaults -> {}
          onReady={handleVideoReady} // defaults -> noop
          // onPlay={func} // defaults -> noop
          // onPause={func} // defaults -> noop
          // onEnd={func} // defaults -> noop
          // onError={func} // defaults -> noop
          // onStateChange={handleStateChange} // defaults -> noop
          // onPlaybackRateChange={func} // defaults -> noop
          // onPlaybackQualityChange={func} // defaults -> noop
        /> */}
      </div>
      <div className="video-info-container">
        <h3 className="video-title font-label-large">{videoTitle}</h3>
        {loadedVideoMostEmotion === "None" ||
        videoMostEmotionPercentage === 0 ? (
          <h3 className="video-emotion-data-empty font-body-medium">
            아직 시청기록이 없어요.
          </h3>
        ) : (
          <div className="video-emotion-container">
            <div
              className={`video-emoji-container ${type} ${videoMostEmotion}`}
            >
              {emojiOfEmotion[videoMostEmotion]}
            </div>
            <h3 className="video-emotion-data font-body-medium">
              {labelOfEmotion[videoMostEmotion]}
              {type === "big-emoji" ? <br /> : ` `}
              {videoMostEmotionPercentage}%
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoItem;

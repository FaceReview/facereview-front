import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import YouTube, { YouTubeEvent } from 'react-youtube';
import EmotionBadge from 'components/EmotionBadge/EmotionBadge';
import { Options, YouTubePlayer } from 'youtube-player/dist/types';
import './watchpage.scss';
import { socket } from 'socket';
import React from 'react';
import ProfileIcon from 'components/ProfileIcon/ProfileIcon';
import TextInput from 'components/TextInput/TextInput';
import UploadButton from 'components/UploadButton/UploadButton';
import { ResponsiveBar } from '@nivo/bar';
import {
  CommentType,
  EmotionType,
  VideoDetailType,
  VideoRelatedType,
} from 'types';
import { getRelatedVideo, getVideoDetail } from 'api/youtube';
import Devider from 'components/Devider/Devider';
import { useAuthStorage } from 'store/authStore';
import { toast } from 'react-toastify';
import {
  addHits,
  addLike,
  cancelLike,
  checkLike,
  deleteComment,
  getMainDistributionData,
  getVideoComments,
  modifyComment,
  sendNewComment,
} from 'api/watch';
import {
  getDistributionToGraphData,
  getTimeToString,
  mapNumberToEmotion,
} from 'utils/index';
import VideoItem from 'components/VideoItem/VideoItem';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import safeImage from 'assets/img/safeImage.png';
import LikeButton from 'components/LikeButton/LikeButton';
import { ResponsiveLine } from '@nivo/line';
import SomeIcon from 'components/SomeIcon/SomeIcon';
import useMediaQuery from 'utils/useMediaQuery';

const WatchPage = (): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const [modifyingComment, setModifyingComment] = useState<string>('');
  const { id } = useParams();
  const navigate = useNavigate();
  const opts: Options = useMemo(
    () =>
      isMobile
        ? {
            width: '100%',
            height: `${window.innerWidth * (9 / 16)}px`,
            playerVars: {
              autoplay: 1,
              color: 'white',
              rel: 0,
              origin: window.location.origin,
            },
          }
        : {
            width: 852,
            height: 480,
            playerVars: {
              autoplay: 1,
              color: 'white',
              rel: 0,
              origin: window.location.origin,
            },
          },
    [isMobile]
  );
  const emotionByEmotionText: { emotion: EmotionType; emotionText: string }[] =
    [
      { emotion: 'happy', emotionText: '즐거운' },
      { emotion: 'sad', emotionText: '슬픈' },
      { emotion: 'surprise', emotionText: '놀란' },
      { emotion: 'angry', emotionText: '화나는' },
      { emotion: 'neutral', emotionText: '무표정' },
    ];
  const {
    is_sign_in,
    access_token,
    user_profile,
    user_announced,
    setUserAnnounced,
  } = useAuthStorage();
  const navigation = useNavigate();

  const webcamRef = useRef<Webcam>(null);
  const webcamOptions = isMobile
    ? {
        width: window.innerWidth - 32,
        height: (window.innerWidth - 32) * (9 / 16),
      }
    : {
        width: 320,
        height: 180,
      };

  const [myGraphData, setMyGraphData] = useState([
    {
      happy: 0,
      happyColor: '#FF4D8D',
      sad: 0,
      sadColor: '#479CFF',
      surprise: 0,
      surpriseColor: '#92C624',
      angry: 0,
      angryColor: '#FF6B4B',
      neutral: 100,
      neutralColor: '#393946',
    },
  ]);
  const [othersGraphData, setOthersGraphData] = useState([
    {
      happy: 0,
      happyColor: '#FF4D8D',
      sad: 0,
      sadColor: '#479CFF',
      surprise: 0,
      surpriseColor: '#92C624',
      angry: 0,
      angryColor: '#FF6B4B',
      neutral: 100,
      neutralColor: '#393946',
    },
  ]);
  const [videoGraphData, setVideoGraphData] = useState([
    {
      id: 'neutral',
      data: [
        { x: '1', y: 100 },
        { x: '2', y: 100 },
      ],
    },
    {
      id: 'happy',
      data: [
        { x: '1', y: 0 },
        { x: '2', y: 0 },
      ],
    },
    {
      id: 'sad',
      data: [
        { x: '1', y: 0 },
        { x: '2', y: 0 },
      ],
    },
    {
      id: 'surprise',
      data: [
        { x: '1', y: 0 },
        { x: '2', y: 0 },
      ],
    },
    {
      id: 'angry',
      data: [
        { x: '1', y: 0 },
        { x: '2', y: 0 },
      ],
    },
  ]);
  const [video, setVideo] = useState<YouTubePlayer | null>(null);
  const [videoData, setVideoData] = useState<VideoDetailType>();
  const [isLikeVideo, setIsLikeVideo] = useState(false);
  const [currentMyEmotion, setCurrentMyEmotion] =
    useState<EmotionType>('neutral');
  const [currentOthersEmotion, setCurrentOthersEmotion] =
    useState<EmotionType>('neutral');
  const [relatedVideoList, setRelatedVideoList] = useState<VideoRelatedType[]>(
    []
  );
  const [isModalOpen1, setIsModalOpen1] = useState<boolean>(false);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean>(false);
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState<CommentType[]>([]);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot() || '';
    return imageSrc?.split(',')[1];
  }, [webcamRef]);

  const handleVideoReady = (e: YouTubeEvent<YouTubePlayer>) => {
    setVideo(e.target);
  };

  const getCurrentTimeString = (seconds: number): string => {
    let remainSeconds = seconds;

    const resHours = Math.floor(remainSeconds / (60 * 60))
      .toString()
      .padStart(1, '0');
    remainSeconds = remainSeconds % (60 * 60);

    const resMinutes = Math.floor(remainSeconds / 60)
      .toString()
      .padStart(2, '0');
    remainSeconds = remainSeconds % 60;

    const resSeconds = Math.round(remainSeconds).toString().padStart(2, '0');

    return `${resHours}:${resMinutes}:${resSeconds}`;
  };

  const handleCommentSubmit = () => {
    if (is_sign_in) {
      if (comment.length > 0) {
        sendNewComment({
          comment_contents: comment,
          youtube_url: id || '',
        })
          .then(() => {
            getVideoComments({ youtube_url: id || '' })
              .then((response) => {
                setCommentList(response);
              })
              .catch(() => {});
            setComment('');
          })
          .catch(() => {
            toast.error('댓글이 달리지 않았어요', {
              toastId: 'error new comment',
            });
          });
      }
      return;
    }
    toast.warn('로그인이 필요합니다', { toastId: 'need sign in' });
    navigation('/auth/1');
  };

  useEffect(() => {
    if (isModalOpen1 || isModalOpen2) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isModalOpen1, isModalOpen2]);

  const openModal1 = () => {
    setIsModalOpen1(true);
  };
  const closeModal1 = () => {
    setUserAnnounced({ user_announced: true });
    setIsModalOpen1(false);
  };
  const openModal2 = () => {
    setIsModalOpen2(true);
  };
  const closeModal2 = () => {
    setIsModalOpen2(false);
    setIsEditVisible(null);
  };

  const handleLikeClick = () => {
    if (is_sign_in) {
      if (isLikeVideo) {
        cancelLike({ youtube_url: id || '' })
          .then(() => {
            checkLike({ youtube_url: id || '' })
              .then((res) => {
                setIsLikeVideo(!!res.like_flag);
              })
              .catch((err) => {
                console.log(err);
              });
            getVideoDetail({ youtube_url: id || '' })
              .then((res) => {
                setVideoData(res);
              })
              .catch(() => {});
          })
          .catch(() => {});
      } else {
        addLike({ youtube_url: id || '' })
          .then(() => {
            checkLike({ youtube_url: id || '' })
              .then((res) => {
                setIsLikeVideo(!!res.like_flag);
              })
              .catch(() => {});
            getVideoDetail({ youtube_url: id || '' })
              .then((res) => {
                setVideoData(res);
              })
              .catch(() => {});
          })
          .catch(() => {});
      }
      return;
    }
    navigate('/auth/1');
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    getVideoDetail({ youtube_url: id || '' })
      .then((res) => {
        setVideoData(res);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!user_announced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openModal1();
    }
  }, [user_announced]);

  useEffect(() => {
    socket.connect();
    addHits({
      youtube_url: id || '',
      user_categorization: is_sign_in ? 'user' : 'non-user',
    })
      .then(() => {})
      .catch((err) => console.log(err));
    getRelatedVideo({ youtube_url: id || '' })
      .then((res) => {
        setRelatedVideoList(res);
      })
      .catch(() => {});
    getVideoComments({ youtube_url: id || '' })
      .then((res) => {
        setCommentList(res);
      })
      .catch(() => {});

    getMainDistributionData({ youtube_url: id || '' })
      .then((res) => {
        setVideoGraphData(getDistributionToGraphData(res));
      })
      .catch((err) => console.log(err));
    checkLike({ youtube_url: id || '' })
      .then((res) => {
        setIsLikeVideo(!!res.like_flag);
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {
      socket.disconnect();
    };
  }, [id, is_sign_in]);

  useEffect(() => {
    const captureInterval = setInterval(() => {
      capture();
    }, 200);

    const frameDataInterval = setInterval(async () => {
      const capturedImage = await capture();
      const currentTime = await video?.getCurrentTime();
      const formattedCurrentTime = getCurrentTimeString(currentTime || 0);

      socket.emit(
        'client_message',
        {
          cur_access_token: access_token,
          youtube_running_time: formattedCurrentTime,
          string_frame_data: capturedImage,
          youtube_index: videoData?.youtube_index,
        },
        (response: {
          happy: number;
          sad: number;
          surprise: number;
          angry: number;
          neutral: number;
          most_emotion: EmotionType;
          youtube_emotion_data: EmotionType;
          youtube_emotion_neutral_per: number;
          youtube_emotion_angry_per: number;
          youtube_emotion_happy_per: number;
          youtube_emotion_surprise_per: number;
          youtube_emotion_sad_per: number;
        }) => {
          setCurrentMyEmotion(response.most_emotion);
          setMyGraphData([
            {
              ...myGraphData[0],
              happy: response.happy,
              sad: response.sad,
              surprise: response.surprise,
              angry: response.angry,
              neutral: response.neutral,
            },
          ]);
          setCurrentOthersEmotion(response.youtube_emotion_data);
          setOthersGraphData([
            {
              ...othersGraphData[0],
              happy: response.youtube_emotion_happy_per,
              sad: response.youtube_emotion_sad_per,
              surprise: response.youtube_emotion_surprise_per,
              angry: response.youtube_emotion_angry_per,
              neutral: response.youtube_emotion_neutral_per,
            },
          ]);
        }
      );
    }, 1000);

    return () => {
      clearInterval(frameDataInterval);
      clearInterval(captureInterval);
    };
  }, [
    access_token,
    capture,
    myGraphData,
    othersGraphData,
    video,
    videoData?.youtube_index,
  ]);

  const GraphDetailDataItem = ({
    graphData,
    emotion,
    emotionText,
    mostEmotion,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphData: any;
    emotion: EmotionType;
    emotionText: string;
    mostEmotion: EmotionType;
  }) => {
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
  };

  const [hoveredComment, setHoveredComment] = useState<number | null>(null);
  const [isEditVisible, setIsEditVisible] = useState<number | null>(null);
  const [editingcommentindex, setEditingcommentindex] = useState<number | null>(
    null
  );

  const CommentItem = ({
    user_name,
    comment_date,
    comment_contents,
    user_profile,
    modify_check,
    identify,
    comment_index,
  }: CommentType): ReactElement => {
    return (
      <div
        className="comment-item-container"
        onMouseEnter={() => {
          if (identify === 1) {
            setHoveredComment(comment_index);
          }
        }}
        onMouseLeave={() => {
          setHoveredComment(null);
          setIsEditVisible(null);
        }}>
        <ProfileIcon
          type={'icon-small'}
          color={mapNumberToEmotion(user_profile)}
          style={{ marginRight: '12px' }}
        />
        <div className="comment-right-container">
          <div className="comment-text-wrapper">
            <div className="comment-info-wrapper">
              <div className="comment-nickname font-label-small">
                {user_name}
              </div>
              <div className="comment-time-text font-label-small">
                {comment_date}
                {modify_check ? <>(수정됨)</> : null}
              </div>
            </div>
            <div className="comment-text font-body-medium">
              {comment_contents}
            </div>
          </div>

          <div className="comment-icon-container">
            {hoveredComment === comment_index && (
              <SomeIcon
                type={'more'}
                onClick={() => setIsEditVisible(comment_index)}
              />
            )}
            <div
              className={`comment-edit-container ${
                isEditVisible === comment_index && 'visible'
              }`}>
              <div
                className="comment-modify-text"
                onClick={() => {
                  setIsEditVisible(null);
                  setEditingcommentindex(comment_index);
                }}>
                <div className="comment-modify-dim"></div>
                수정
              </div>
              <div
                className="comment-delete-text"
                onClick={() => {
                  setIsEditVisible(null);
                  openModal2();
                }}>
                <div className="comment-delete-dim"></div>
                삭제
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Moved this useEffect outside of CommentItem
    if (editingcommentindex !== null) {
      commentList.map(
        (item, i) =>
          item.comment_index === editingcommentindex &&
          setModifyingComment(commentList[i].comment_contents)
      );
    }
  }, [editingcommentindex, commentList]);

  const renderMobileContainer = () => {
    return (
      <div className="watch-page-cam-container">
        <Webcam
          style={{ borderRadius: '8px', marginBottom: '24px' }}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={webcamOptions}
          mirrored={true}
          screenshotQuality={0.5}
        />
        <div className="emotion-container">
          <div className="emotion-title-wrapper">
            <h4 className="emotion-title font-title-small">실시간 나의 감정</h4>
            <EmotionBadge type="big" emotion={currentMyEmotion} />
          </div>
          <div className="graph-container">
            <ResponsiveBar
              data={myGraphData}
              keys={['happy', 'sad', 'surprise', 'angry', 'neutral']}
              indexBy="country"
              padding={0.3}
              layout="horizontal"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#FF4D8D', '#479CFF', '#92C624', '#FF6B4B', '#393946']}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]],
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableGridY={false}
              enableLabel={false}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 2.3]],
              }}
              margin={{ top: -10, bottom: -10 }}
              legends={[]}
              role="application"
              ariaLabel="Nivo bar chart demo"
              barAriaLabel={(e) =>
                e.id + ': ' + e.formattedValue + ' in country: ' + e.indexValue
              }
            />
          </div>

          <div className="graph-detail-container">
            {emotionByEmotionText.map((e) => (
              <GraphDetailDataItem
                key={uuidv4()}
                graphData={myGraphData}
                emotion={e.emotion}
                emotionText={e.emotionText}
                mostEmotion={currentMyEmotion}
              />
            ))}
          </div>
        </div>
        <div className="emotion-container">
          <div className="emotion-title-wrapper">
            <h4 className="emotion-title font-title-small">
              실시간 다른 사람들의 감정
            </h4>
            <EmotionBadge type="big" emotion={currentOthersEmotion} />
          </div>

          <div className="graph-container">
            <ResponsiveBar
              data={othersGraphData}
              keys={['happy', 'sad', 'surprise', 'angry', 'neutral']}
              indexBy="country"
              padding={0.3}
              layout="horizontal"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#FF4D8D', '#479CFF', '#92C624', '#FF6B4B', '#393946']}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]],
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableGridY={false}
              enableLabel={false}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 2.3]],
              }}
              margin={{ top: -10, bottom: -10 }}
              legends={[]}
              role="application"
              ariaLabel="Nivo bar chart demo"
              barAriaLabel={(e) =>
                e.id + ': ' + e.formattedValue + ' in country: ' + e.indexValue
              }
            />
          </div>
          <div className="graph-detail-container">
            {emotionByEmotionText.map((e) => (
              <GraphDetailDataItem
                key={e.emotion}
                graphData={othersGraphData}
                emotion={e.emotion}
                emotionText={e.emotionText}
                mostEmotion={currentOthersEmotion}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="watch-page-container">
      <ModalDialog
        type={'one-button'}
        name="watch-page-modal"
        isOpen={isModalOpen1}
        onClose={closeModal1}>
        <div className="watch-page-modal-image-container">
          <img
            className="watch-page-modal-image"
            src={safeImage}
            alt="safe-img"
          />
        </div>
        <div className="watch-page-modal-label-container">
          <h2 className="watch-page-modal-title font-title-medium">
            안심하세요!
          </h2>
          <p className="font-body-large">
            영상 시청 중의 나의 모습은 기록되거나 저장되지 않아요.
          </p>
        </div>
      </ModalDialog>
      <div className="main-container">
        <div className="video-fixed-container">
          <div className="video-container">
            <YouTube
              videoId={id}
              style={{ marginBottom: '4px' }} // defaults -> {}
              opts={opts} // defaults -> {}
              onReady={handleVideoReady} // defaults -> noop
            />
            <div className="video-graph-container">
              <ResponsiveLine
                data={videoGraphData}
                colors={['#393946', '#FF4D8D', '#479CFF', '#92C624', '#FF6B4B']}
                margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 0,
                  max: 100,
                  reverse: false,
                }}
                curve={'natural'}
                yFormat=" >-.2f"
                axisTop={null}
                axisRight={null}
                enableGridX={false}
                enableGridY={false}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'transportation',
                  legendOffset: 36,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'count',
                  legendOffset: -40,
                  legendPosition: 'middle',
                }}
                pointSize={0}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={0}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>

          <div className="video-information-container">
            <div
              className={
                isMobile ? 'title font-title-small' : 'title font-title-medium'
              }>
              {videoData?.youtube_title}
            </div>
            <div className="right-side">
              <LikeButton
                label={(videoData?.youtube_like || 0) + ''}
                isActive={isLikeVideo}
                onClick={handleLikeClick}
              />
              <p className="video-hits-text font-label-small">
                조회수 {videoData?.youtube_hits || 0}회
              </p>
            </div>
          </div>
          {isMobile && <Devider />}
        </div>

        {isMobile && renderMobileContainer()}
        {isMobile && (
          <Devider style={{ width: '100vw', marginLeft: '-16px' }} />
        )}

        <div className="comment-container">
          {!isMobile && (
            <div className="comment-input-container">
              <ProfileIcon
                type={'icon-medium'}
                color={mapNumberToEmotion(user_profile)}
                style={{ marginRight: '12px' }}
              />
              <TextInput
                inputType="underline"
                value={comment}
                onChange={setComment}
                placeholder={'영상에 대한 의견을 남겨보아요'}
              />
              <UploadButton
                onClick={handleCommentSubmit}
                style={{
                  marginLeft: '12px',
                  display: comment.length > 0 ? 'block' : 'none',
                }}
              />
            </div>
          )}
          <div
            className={
              isMobile
                ? 'comment-info-text font-title-mini'
                : 'comment-info-text font-title-small'
            }>
            댓글 {commentList.length || 0}개
          </div>
          <div className="comment-list-container">
            {commentList.length > 0 ? (
              commentList.map((comment, idx) =>
                comment.comment_index === editingcommentindex ? (
                  <div className="comment-modifying-container">
                    <ProfileIcon
                      type={'icon-small'}
                      color={mapNumberToEmotion(user_profile)}
                      style={{ marginRight: '12px' }}
                    />
                    <div className="comment-modifying-wrapper">
                      <div className="comment-modifying-info-wrapper">
                        <div className="comment-modifying-nickname font-label-small">
                          {comment.user_name}
                        </div>
                        <div className="comment-modifying-time-text font-label-small">
                          {getTimeToString(comment.comment_date)}
                        </div>
                      </div>
                      <TextInput
                        inputType="underline"
                        value={modifyingComment}
                        onChange={setModifyingComment}
                        placeholder={''}
                        style={{ marginBottom: '16px' }}
                      />
                      <div className="comment-modifying-button-wrapper">
                        <div
                          className="comment-modifying-cancel font-label-small"
                          onClick={() => {
                            setEditingcommentindex(null);
                          }}>
                          취소
                        </div>
                        <div
                          className="comment-modifying-save font-label-small"
                          onClick={() => {
                            modifyComment({
                              comment_index: editingcommentindex,
                              new_comment_contents: modifyingComment,
                            })
                              .then(() => {
                                getVideoComments({ youtube_url: id || '' })
                                  .then((res) => {
                                    setCommentList(res);
                                  })
                                  .catch(() => {});
                                setEditingcommentindex(null);
                              })
                              .catch(() => {});
                          }}
                          style={{
                            pointerEvents:
                              modifyingComment.length > 0 ? 'auto' : 'none',
                          }}>
                          저장
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <CommentItem
                      key={`comment-${comment.comment_contents}-${idx}`}
                      user_name={comment.user_name}
                      comment_date={getTimeToString(comment.comment_date)}
                      comment_contents={comment.comment_contents}
                      user_profile={comment.user_profile}
                      comment_index={comment.comment_index}
                      modify_check={comment.modify_check}
                      identify={comment.identify}
                    />
                    <ModalDialog
                      type={'two-button'}
                      name={'comment-delete-modal'}
                      isOpen={isModalOpen2}
                      onClose={closeModal2}
                      onCheck={() => {
                        deleteComment({ comment_index: comment.comment_index })
                          .then(() => {
                            getVideoComments({ youtube_url: id || '' })
                              .then((res) => {
                                setCommentList(res);
                                closeModal2();
                              })
                              .catch(() => {});
                          })
                          .catch(() => {
                            // console.log(error); // Removed unused error var
                          });
                      }}>
                      <h2>댓글을 삭제하시겠어요?</h2>
                    </ModalDialog>
                  </>
                )
              )
            ) : (
              <p className="no-comments-text font-label-large">
                아직 댓글이 없어요
              </p>
            )}
          </div>
        </div>
        {isMobile && (
          <Devider style={{ width: '100vw', marginLeft: '-16px' }} />
        )}
      </div>
      <div className="side-container">
        {!isMobile && (
          <>
            <Webcam
              style={{ borderRadius: '8px', marginBottom: '24px' }}
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={webcamOptions}
              mirrored={true}
              screenshotQuality={0.5}
            />
            <div className="emotion-container">
              <div className="emotion-title-wrapper">
                <h4 className="emotion-title font-title-small">
                  실시간 나의 감정
                </h4>
                <EmotionBadge type="big" emotion={currentMyEmotion} />
              </div>
              <div className="graph-container">
                <ResponsiveBar
                  data={myGraphData}
                  keys={['happy', 'sad', 'surprise', 'angry', 'neutral']}
                  indexBy="country"
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={[
                    '#FF4D8D',
                    '#479CFF',
                    '#92C624',
                    '#FF6B4B',
                    '#393946',
                  ]}
                  borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridY={false}
                  enableLabel={false}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 2.3]],
                  }}
                  margin={{ top: -10, bottom: -10 }}
                  legends={[]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) =>
                    e.id +
                    ': ' +
                    e.formattedValue +
                    ' in country: ' +
                    e.indexValue
                  }
                />
              </div>
              <div className="graph-detail-container">
                {emotionByEmotionText.map((e) => (
                  <GraphDetailDataItem
                    key={uuidv4()}
                    graphData={myGraphData}
                    emotion={e.emotion}
                    emotionText={e.emotionText}
                    mostEmotion={currentMyEmotion}
                  />
                ))}
              </div>
            </div>
            <div className="emotion-container">
              <div className="emotion-title-wrapper">
                <h4 className="emotion-title font-title-small">
                  실시간 다른 사람들의 감정
                </h4>
                <EmotionBadge type="big" emotion={currentOthersEmotion} />
              </div>
              <div className="graph-container">
                <ResponsiveBar
                  data={othersGraphData}
                  keys={['happy', 'sad', 'surprise', 'angry', 'neutral']}
                  indexBy="country"
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={[
                    '#FF4D8D',
                    '#479CFF',
                    '#92C624',
                    '#FF6B4B',
                    '#393946',
                  ]}
                  borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridY={false}
                  enableLabel={false}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 2.3]],
                  }}
                  margin={{ top: -10, bottom: -10 }}
                  legends={[]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) =>
                    e.id +
                    ': ' +
                    e.formattedValue +
                    ' in country: ' +
                    e.indexValue
                  }
                />
              </div>
              <div className="graph-detail-container">
                {emotionByEmotionText.map((e) => (
                  <GraphDetailDataItem
                    key={uuidv4()}
                    graphData={othersGraphData}
                    emotion={e.emotion}
                    emotionText={e.emotionText}
                    mostEmotion={currentOthersEmotion}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        <div className="recommend-container">
          <h4 className="recommend-title font-title-small">
            이 영상은 어때요?
          </h4>
          <div className="recommend-video-container">
            {relatedVideoList.map((v, index) => (
              <VideoItem
                key={v.youtube_url || index}
                width={isMobile ? window.innerWidth - 32 : 320}
                videoId={v.youtube_url}
                videoTitle={v.youtube_title}
                videoMostEmotion={v.most_emotion}
                videoMostEmotionPercentage={v.emotion_per}
                style={{ marginBottom: '24px' }}
                type={'small-emoji'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;

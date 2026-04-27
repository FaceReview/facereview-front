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
import { YouTubePlayer } from 'youtube-player/dist/types';
import './watchpage.scss';
import { socket } from 'socket';
import React from 'react';
import ProfileIcon from 'components/ProfileIcon/ProfileIcon';
import TextInput from 'components/TextInput/TextInput';
import UploadButton from 'components/UploadButton/UploadButton';
import { ResponsiveBar } from '@nivo/bar';
import { EmotionType, VideoDetailType } from 'types';
import { getRelatedVideo, getVideoDetail } from 'api/youtube';
import Devider from 'components/Devider/Devider';
import { useAuthStorage } from 'store/authStore';
import { toast } from 'react-toastify';
import {
  addLike,
  cancelLike,
  deleteComment,
  getVideoComments,
  modifyComment,
  sendNewComment,
} from 'api/watch';
import {
  getScaledTimelineGraphData,
  getTimeToString,
  mapNumberToEmotion,
} from 'utils/index';
import VideoItem from 'components/VideoItem/VideoItem';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import Button from 'components/Button/Button';
import safeImage from 'assets/img/safeImage.png';
import LikeButton from 'components/LikeButton/LikeButton';
import { ResponsiveLine } from '@nivo/line';
import useMediaQuery from 'hooks/useMediaQuery';
import { EMOTION_COLORS, EMOTION_LABELS, EMOTIONS } from 'constants/index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GraphDetailDataItem from 'components/GraphDetailDataItem/GraphDetailDataItem';
import CommentItem from 'components/CommentItem/CommentItem';

let disconnectTimer: NodeJS.Timeout | null = null;

// Hoisted module-level constants to avoid re-creation on every render
const EMOTION_BY_EMOTION_TEXT = EMOTIONS.map((emotion) => ({
  emotion,
  emotionText: EMOTION_LABELS[emotion],
}));

const BAR_CHART_COLORS = EMOTIONS.map((e) => EMOTION_COLORS[e]);
const BAR_CHART_BORDER_COLOR = { from: 'color' as const, modifiers: [['darker', 1.6] as ['darker', number]] };
const BAR_CHART_LABEL_TEXT_COLOR = { from: 'color' as const, modifiers: [['darker', 2.3] as ['darker', number]] };
const BAR_CHART_MARGIN = { top: -10, bottom: -10 };
const LINE_CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
const WEBCAM_STYLE = { borderRadius: '8px', marginBottom: '24px' };
const PROFILE_ICON_STYLE = { marginRight: '12px' };

const WatchPage = (): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const [modifyingComment, setModifyingComment] = useState<string>('');
  const { id } = useParams();
  const navigate = useNavigate();
  const opts = useMemo(
    () =>
      isMobile
        ? {
            width: '100%',
            height: `${window.innerWidth * (9 / 16)}px`,
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
              autoplay: 1 as const,
              color: 'white' as const,
              rel: 0 as const,
              origin: window.location.origin,
            },
          }
        : {
            width: 852,
            height: 480,
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
              autoplay: 1 as const,
              color: 'white' as const,
              rel: 0 as const,
              origin: window.location.origin,
            },
          },
    [isMobile],
  );

  // Zustand selector optimization: subscribe to individual slices
  const is_sign_in = useAuthStorage((s) => s.is_sign_in);
  const access_token = useAuthStorage((s) => s.access_token);
  const user_id = useAuthStorage((s) => s.user_id);
  const user_profile = useAuthStorage((s) => s.user_profile);
  const user_announced = useAuthStorage((s) => s.user_announced);
  const setUserAnnounced = useAuthStorage((s) => s.setUserAnnounced);

  const [videoViewLogId] = useState<string>(uuidv4()); // Generate log ID once

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
    EMOTIONS.reduce(
      (acc, emotion) => ({
        ...acc,
        [emotion]: emotion === 'neutral' ? 100 : 0,
        [`${emotion}Color`]: EMOTION_COLORS[emotion],
      }),
      { id: 'my-emotion' } as Record<string, string | number>,
    ),
  ]);
  const [othersGraphData, setOthersGraphData] = useState([
    EMOTIONS.reduce(
      (acc, emotion) => ({
        ...acc,
        [emotion]: emotion === 'neutral' ? 100 : 0,
        [`${emotion}Color`]: EMOTION_COLORS[emotion],
      }),
      { id: 'others-emotion' } as Record<string, string | number>,
    ),
  ]);
  const queryClient = useQueryClient();

  const { data: videoData } = useQuery({
    queryKey: ['videoDetail', id],
    queryFn: () => getVideoDetail({ video_id: id || '' }),
    enabled: !!id,
  });

  const { data: relatedVideoList = [] } = useQuery({
    queryKey: ['relatedVideos', id],
    queryFn: () => getRelatedVideo({ video_id: id || '' }),
    enabled: !!id,
  });

  const { data: commentList = [] } = useQuery({
    queryKey: ['videoComments', id],
    queryFn: () => getVideoComments({ video_id: id || '' }),
    enabled: !!id,
  });

  const isLikeVideo = videoData?.user_is_liked ?? false;

  const [video, setVideo] = useState<YouTubePlayer | null>(null);
  const [currentMyEmotion, setCurrentMyEmotion] =
    useState<EmotionType>('neutral');
  const [currentOthersEmotion, setCurrentOthersEmotion] =
    useState<EmotionType>('neutral');
  const [isModalOpen1, setIsModalOpen1] = useState<boolean>(false);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean>(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState<boolean>(false);

  const [comment, setComment] = useState('');

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      return imageSrc.split(',')[1];
    }
    return '';
  }, [webcamRef]);

  const handleVideoReady = (e: YouTubeEvent<YouTubePlayer>) => {
    setVideo(e.target);
  };

  const handleVideoError = () => {
    setIsDeletedModalOpen(true);
  };

  const commentMutation = useMutation({
    mutationFn: (newComment: string) =>
      sendNewComment({ content: newComment, video_id: id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoComments', id] });
      setComment('');
    },
    onError: () => {
      toast.error('댓글이 달리지 않았어요', { toastId: 'error new comment' });
    },
  });

  const modifyCommentMutation = useMutation({
    mutationFn: (params: { comment_id: string; content: string }) =>
      modifyComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoComments', id] });
      setEditingcommentindex(null);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (comment_id: string) => deleteComment({ comment_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoComments', id] });
      closeModal2();
    },
  });

  const handleCommentSubmit = () => {
    if (is_sign_in) {
      if (comment.length > 0) {
        commentMutation.mutate(comment);
      }
      return;
    }
    toast.warn('로그인이 필요합니다', { toastId: 'need sign in' });
    navigate('/auth/1');
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

  const likeMutation = useMutation({
    mutationFn: () =>
      isLikeVideo
        ? cancelLike({ video_id: id || '' })
        : addLike({ video_id: id || '' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['videoDetail', id] });
      const previousVideoData = queryClient.getQueryData([
        'videoDetail',
        id,
      ]) as VideoDetailType | undefined;

      if (previousVideoData) {
        queryClient.setQueryData(['videoDetail', id], {
          ...previousVideoData,
          user_is_liked: !isLikeVideo,
          like_count: isLikeVideo
            ? previousVideoData.like_count - 1
            : previousVideoData.like_count + 1,
        });
      }

      return { previousVideoData };
    },
    onError: (err, variables, context) => {
      if (context?.previousVideoData) {
        queryClient.setQueryData(
          ['videoDetail', id],
          context.previousVideoData,
        );
      }
      toast.error('좋아요 처리에 실패했습니다.', { toastId: 'likeError' });
    },
  });

  const handleLikeClick = () => {
    if (is_sign_in) {
      likeMutation.mutate();
      return;
    }
    navigate('/auth/1');
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const videoGraphData = useMemo(() => {
    if (
      videoData?.timeline_data &&
      Object.keys(videoData.timeline_data).length > 0
    ) {
      return getScaledTimelineGraphData(
        videoData.timeline_data,
        videoData.duration,
      );
    }
    return [];
  }, [videoData]);

  useEffect(() => {
    if (!user_announced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openModal1();
    }
  }, [user_announced]);

  useEffect(() => {
    if (is_sign_in) {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }

      if (!socket.connected) {
        socket.connect();
      }

      // Socket Debug Listeners
      const onConnect = () => {
        console.log('✅ Socket connected:', socket.id);
      };
      const onDisconnect = () => {
        console.log('❌ Socket disconnected');
      };
      const onConnectError = (err: Error) =>
        console.error('⚠️ Socket connection error:', err);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);

      // Catch-all listener for debugging
      socket.onAny((event, ...args) => {
        console.log(`📩 Socket received event: ${event}`, args);
      });
    }

    // Main distribution data is now part of video detail (timeline_data)

    return () => {
      if (is_sign_in) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.offAny(); // Clean up

        // Debounce socket disconnect to prevent "WebSocket is closed before the connection is established" in StrictMode
        disconnectTimer = setTimeout(() => {
          socket.disconnect();
        }, 300);
      }
    };
  }, [id, is_sign_in]);

  useEffect(() => {
    const captureInterval = setInterval(() => {
      capture();
    }, 500);

    const frameDataInterval = setInterval(async () => {
      // Only emit if signed in, video is playing/ready, and actually playing (state 1)
      if (!is_sign_in || !video || !videoData) return;

      const playerState = await video.getPlayerState();
      if (playerState !== 1) return;

      const capturedImage = capture();
      // Wait until webcam is ready to provide frame data
      if (!capturedImage) return;

      const currentTime = await video?.getCurrentTime();
      // const formattedCurrentTime = getCurrentTimeString(currentTime || 0); // Not needed for payload, strictly

      console.log(`[Socket] Sending watch_frame (time: ${currentTime})`, {
        video_view_log_id: videoViewLogId,
        youtube_running_time: parseFloat((currentTime || 0).toFixed(2)),
        image_length: capturedImage?.length,
        duration: videoData.duration,
        user_id: user_id,
        video_id: videoData.video_id, // Internal UUID
      });

      socket.emit(
        'watch_frame',
        {
          video_view_log_id: videoViewLogId,
          youtube_running_time: parseFloat((currentTime || 0).toFixed(2)), // Numeric, seconds
          frame_data: capturedImage,
          duration: videoData.duration || 0,
          // test
          user_id: user_id,
          video_id: videoData.video_id, // Internal UUID
        },
        (response: {
          status: string;
          response?: {
            user_emotion: {
              most_emotion: EmotionType;
              [key: string]: string | number;
            };
            average_emotion: {
              most_emotion: EmotionType;
              [key: string]: string | number;
            };
          };
        }) => {
          // console.log('[Socket] watch_frame response:', response);
          if (response?.status === 'success' && response?.response) {
            console.log(
              '[Socket] Updating graph data with:',
              response.response,
            );
            const { user_emotion, average_emotion } = response.response;

            setCurrentMyEmotion(user_emotion.most_emotion);
            setMyGraphData((prev) => [
              {
                ...prev[0],
                ...user_emotion, // This assumes user_emotion keys match graph data keys
              },
            ]);
            setCurrentOthersEmotion(average_emotion.most_emotion);
            setOthersGraphData((prev) => [
              {
                ...prev[0],
                ...average_emotion,
              },
            ]);
          } else if (response?.status === 'error') {
            console.error('[Socket] watch_frame error:', response);
          }
        },
      );
    }, 1000);

    return () => {
      clearInterval(frameDataInterval);
      clearInterval(captureInterval);
    };
  }, [
    access_token,
    capture,
    video,
    videoData,
    is_sign_in,
    user_id,
    videoViewLogId,
  ]);

  // GraphDetailDataItem and CommentItem are now external components

  const [hoveredComment, setHoveredComment] = useState<string | null>(null);
  const [isEditVisible, setIsEditVisible] = useState<string | null>(null);
  const [editingcommentindex, setEditingcommentindex] = useState<string | null>(
    null,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // CommentItem callbacks — React Compiler handles memoization automatically
  const handleCommentMouseEnter = (commentId: string) => {
    setHoveredComment(commentId);
  };

  const handleCommentMouseLeave = () => {
    setHoveredComment(null);
    setIsEditVisible(null);
  };

  const handleCommentEditClick = (commentId: string) => {
    setIsEditVisible(commentId);
  };

  const handleCommentDeleteClick = () => {
    setIsEditVisible(null);
    openModal2();
  };

  const handleCommentStartEditing = (commentId: string) => {
    setIsEditVisible(null);
    setEditingcommentindex(commentId);
  };

  useEffect(() => {
    // Moved this useEffect outside of CommentItem
    if (editingcommentindex !== null) {
      commentList.map(
        (item, i) =>
          item.comment_id === editingcommentindex &&
          setModifyingComment(commentList[i].content),
      );
    }
  }, [editingcommentindex, commentList]);

  const renderMobileContainer = () => {
    return (
      <div className="watch-page-cam-container">
        <Webcam
          style={WEBCAM_STYLE}
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
              keys={EMOTIONS as unknown as string[]}
              indexBy="id"
              padding={0.3}
              layout="horizontal"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={BAR_CHART_COLORS}
              borderColor={BAR_CHART_BORDER_COLOR}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableGridY={false}
              enableLabel={false}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={BAR_CHART_LABEL_TEXT_COLOR}
              margin={BAR_CHART_MARGIN}
              legends={[]}
              role="application"
              ariaLabel="Nivo bar chart demo"
              barAriaLabel={(e) => `${e.id}: ${e.formattedValue}%`}
            />
          </div>

          <div className="graph-detail-container">
            {EMOTION_BY_EMOTION_TEXT.map((e) => (
              <GraphDetailDataItem
                key={e.emotion}
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
              keys={EMOTIONS as unknown as string[]}
              indexBy="id"
              padding={0.3}
              layout="horizontal"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={BAR_CHART_COLORS}
              borderColor={BAR_CHART_BORDER_COLOR}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              enableGridY={false}
              enableLabel={false}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={BAR_CHART_LABEL_TEXT_COLOR}
              margin={BAR_CHART_MARGIN}
              legends={[]}
              role="application"
              ariaLabel="Nivo bar chart demo"
              barAriaLabel={(e) => `${e.id}: ${e.formattedValue}%`}
            />
          </div>
          <div className="graph-detail-container">
            {EMOTION_BY_EMOTION_TEXT.map((e) => (
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
      <ModalDialog isOpen={isModalOpen1} onClose={closeModal1}>
        <div className="watch-page-safe-modal-container">
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
          <div className="watch-page-modal-button-wrapper">
            <Button label={'확인'} variant={'cta-full'} onClick={closeModal1} />
          </div>
        </div>
      </ModalDialog>
      <ModalDialog isOpen={isDeletedModalOpen} onClose={() => navigate('/')}>
        <div className="deleted-video-modal-container">
          <div className="deleted-video-modal-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <div className="deleted-video-modal-label-container">
            <h2 className="deleted-video-modal-title font-title-medium">
              삭제된 영상
            </h2>
            <p className="deleted-video-modal-description font-body-large">
              해당 영상은 삭제되어 접근할 수 없습니다.
            </p>
          </div>
          <div className="deleted-video-modal-button-wrapper">
            <Button
              label={'확인'}
              variant={'cta-full'}
              onClick={() => navigate('/')}
            />
          </div>
        </div>
      </ModalDialog>
      <div className="main-container">
        <div className="video-fixed-container">
          <div className="video-container">
            {videoData?.youtube_url ? (
              <YouTube
                videoId={videoData.youtube_url}
                style={{ display: 'block' }}
                opts={opts}
                onReady={handleVideoReady}
                onError={handleVideoError}
              />
            ) : (
              <div
                style={{
                  width: isMobile ? '100%' : 852,
                  height: isMobile ? window.innerWidth * (9 / 16) : 480,
                  backgroundColor: '#1a1a2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}>
                <div className="video-loading-spinner" />
              </div>
            )}
            <div className="video-graph-container">
              {videoGraphData && videoGraphData.length > 0 && (
                <ResponsiveLine
                  data={videoGraphData}
                  colors={BAR_CHART_COLORS}
                  margin={LINE_CHART_MARGIN}
                  xScale={{
                    type: 'linear',
                    min: 0,
                    max: videoData?.duration || 100,
                  }}
                  yScale={{
                    type: 'linear',
                    min: 0,
                    max: 100,
                    stacked: false,
                    reverse: false,
                  }}
                  curve="monotoneX"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridX={false}
                  enableGridY={false}
                  enablePoints={false}
                  useMesh={true}
                  enableSlices={false}
                  lineWidth={2}
                  legends={[]}
                />
              )}
            </div>
          </div>

          <div className="video-information-container">
            <div
              className={
                isMobile ? 'title font-title-small' : 'title font-title-medium'
              }>
              {videoData?.title}
            </div>
            <div className="right-side">
              <LikeButton
                label={(videoData?.like_count || 0) + ''}
                isActive={isLikeVideo}
                onClick={handleLikeClick}
              />
              <p className="video-hits-text font-label-small">
                조회수 {videoData?.view_count || 0}회
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
                style={PROFILE_ICON_STYLE}
              />
              <TextInput
                variant="underline"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
              commentList.map((comment) =>
                comment.comment_id === editingcommentindex ? (
                  <div
                    key={comment.comment_id}
                    className="comment-modifying-container">
                    <ProfileIcon
                      type={'icon-small'}
                      color={mapNumberToEmotion(user_profile)}
                      style={PROFILE_ICON_STYLE}
                    />
                    <div className="comment-modifying-wrapper">
                      <div className="comment-modifying-info-wrapper">
                        <div className="comment-modifying-nickname font-label-small">
                          {comment.user_name}
                        </div>
                        <div className="comment-modifying-time-text font-label-small">
                          {getTimeToString(comment.created_at)}
                        </div>
                      </div>
                      <TextInput
                        variant="underline"
                        value={modifyingComment}
                        onChange={(e) => setModifyingComment(e.target.value)}
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
                            if (editingcommentindex !== null) {
                              modifyCommentMutation.mutate({
                                comment_id: editingcommentindex,
                                content: modifyingComment,
                              });
                            }
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
                  <CommentItem
                    key={comment.comment_id}
                    user_name={comment.user_name}
                    created_at={getTimeToString(comment.created_at)}
                    content={comment.content}
                    user_profile_image_id={comment.user_profile_image_id}
                    comment_id={comment.comment_id}
                    is_modified={comment.is_modified}
                    is_mine={comment.is_mine}
                    user_id={comment.user_id}
                    hoveredComment={hoveredComment}
                    isEditVisible={isEditVisible}
                    onMouseEnter={handleCommentMouseEnter}
                    onMouseLeave={handleCommentMouseLeave}
                    onEditClick={handleCommentEditClick}
                    onDeleteClick={() => {
                      setDeletingCommentId(comment.comment_id);
                      handleCommentDeleteClick();
                    }}
                    onStartEditing={handleCommentStartEditing}
                  />
                ),
              )
            ) : (
              <p className="no-comments-text font-label-large">
                아직 댓글이 없어요
              </p>
            )}
            {/* Single modal instance outside the loop */}
            <ModalDialog isOpen={isModalOpen2} onClose={closeModal2}>
              <div className="comment-delete-modal-container">
                <h2>댓글을 삭제하시겠어요?</h2>
                <div className="comment-delete-modal-button-wrapper">
                  <Button
                    label={'취소'}
                    variant={'cta-fixed-secondary'}
                    style={{
                      marginRight: '12px',
                      background: '#5D5D6D',
                    }}
                    onClick={closeModal2}
                  />
                  <Button
                    label={'확인'}
                    variant={'cta-fixed'}
                    onClick={() => {
                      if (deletingCommentId) {
                        deleteCommentMutation.mutate(deletingCommentId);
                      }
                    }}
                  />
                </div>
              </div>
            </ModalDialog>
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
              style={WEBCAM_STYLE}
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
                  keys={EMOTIONS as unknown as string[]}
                  indexBy="id"
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={BAR_CHART_COLORS}
                  borderColor={BAR_CHART_BORDER_COLOR}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridY={false}
                  enableLabel={false}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={BAR_CHART_LABEL_TEXT_COLOR}
                  margin={BAR_CHART_MARGIN}
                  legends={[]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) => `${e.id}: ${e.formattedValue}%`}
                />
              </div>
              <div className="graph-detail-container">
                {EMOTION_BY_EMOTION_TEXT.map((e) => (
                  <GraphDetailDataItem
                    key={e.emotion}
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
                  keys={EMOTIONS as unknown as string[]}
                  indexBy="id"
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={BAR_CHART_COLORS}
                  borderColor={BAR_CHART_BORDER_COLOR}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridY={false}
                  enableLabel={false}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={BAR_CHART_LABEL_TEXT_COLOR}
                  margin={BAR_CHART_MARGIN}
                  legends={[]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) => `${e.id}: ${e.formattedValue}%`}
                />
              </div>
              <div className="graph-detail-container">
                {EMOTION_BY_EMOTION_TEXT.map((e) => (
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
          </>
        )}
        <div className="recommend-container">
          <h4 className="recommend-title font-title-small">
            이 영상은 어때요?
          </h4>
          <div className="recommend-video-container">
            {relatedVideoList.map((v, index) => (
              <VideoItem
                key={v.video_id || index}
                width={isMobile ? window.innerWidth - 32 : 320}
                videoId={v.youtube_url} // Corrected: use youtube_url for thumbnail
                videoUuid={v.uuid ?? v.id ?? v.video_id}
                videoTitle={v.title}
                videoMostEmotion={v.dominant_emotion}
                videoMostEmotionPercentage={v.dominant_emotion_per}
                style={{ marginBottom: '24px' }}
                type={'small-emoji'}
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;

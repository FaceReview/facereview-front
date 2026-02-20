import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './mypage.scss';

import Button from 'components/Button/Button';
import Chip from 'components/Chip/Chip';
import ProfileIcon from 'components/ProfileIcon/ProfileIcon';
import Devider from 'components/Devider/Devider';
import SomeIcon from 'components/SomeIcon/SomeIcon';

import { ResponsivePie } from '@nivo/pie';
import Etc from 'assets/img/etc.png';
import HeaderToken from 'api/HeaderToken';
import { useAuthStorage } from 'store/authStore';
import VideoItem from 'components/VideoItem/VideoItem';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import TextInput from 'components/TextInput/TextInput';
import { sendEmailVerification, verifyEmailCode } from 'api/mypage';
import { toast } from 'react-toastify';
import {
  getAllEmotionTimeData,
  getDounutGraphData,
  getRecentVideo,
} from 'api/youtube';
import { DonutGraphDataType, EmotionType, VideoWatchedType } from 'types/index';
import { mapNumberToEmotion } from 'utils/index';
import { ResponsiveLine } from '@nivo/line';
import useMediaQuery from 'utils/useMediaQuery';
import {
  EMOTION_COLORS,
  EMOTION_EMOJIS,
  EMOTION_LABELS,
  EMOTIONS,
} from 'constants/index';

const MyPage = () => {
  const {
    is_sign_in,
    user_name,
    user_profile,
    is_verify_email_done,
    setVerifyEmailDone,
  } = useAuthStorage();

  const isMobile = useMediaQuery('(max-width: 1200px)');

  const navigate = useNavigate();
  const { setTempToken } = useAuthStorage();

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [selectedEmotion, setSelectedEmotion] = useState<'all' | EmotionType>(
    'all',
  );
  const [recentVideo, setRecentVideo] = useState<VideoWatchedType[]>([]);
  const [emotionTimeData, setEmotionTimeData] = useState<{
    [key in EmotionType]: number;
  }>({ happy: 0, sad: 0, surprise: 0, angry: 0, neutral: 0 });

  const [donutGraphData, setDonutGraphData] = useState<
    {
      id: string;
      label: string;
      value: number;
      color: string;
      originalId: EmotionType;
    }[]
  >(
    EMOTIONS.map((emotion) => ({
      id: EMOTION_EMOJIS[emotion],
      label: EMOTION_LABELS[emotion],
      value: 0,
      color: EMOTION_COLORS[emotion],
      originalId: emotion,
    })),
  );

  const filteredRecentVideos = recentVideo.filter(
    (v) => selectedEmotion === 'all' || v.most_emotion === selectedEmotion,
  );

  const handleChipClick = (emotion: 'all' | EmotionType) => {
    setSelectedEmotion(emotion);
  };

  const handleLogoutClick = () => {
    HeaderToken.set('');
    setTempToken({ access_token: '' });
    navigate('/main');
  };

  const handleVerifyEmailClick = async () => {
    try {
      await sendEmailVerification();
      toast.success('인증 코드가 발송되었습니다.');
      setIsVerificationModalOpen(true);
    } catch (err) {
      toast.error('인증 코드 발송에 실패했습니다.');
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (verificationCode.length !== 6) {
      toast.error('인증코드 6자리를 입력해주세요.');
      return;
    }
    try {
      await verifyEmailCode({ code: verificationCode });
      toast.success('이메일 인증이 완료되었습니다.');
      setVerifyEmailDone(true);
      setIsVerificationModalOpen(false);
      setVerificationCode('');
    } catch (err) {
      toast.error('인증 코드가 올바르지 않거나 오류가 발생했습니다.');
    }
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (is_sign_in) {
      getRecentVideo()
        .then((data) => {
          console.log(data);
          setRecentVideo(data);
        })
        .catch((err) => console.log(err));
      getDounutGraphData()
        .then((res) => {
          setDonutGraphData((prevData) =>
            prevData.map((item) => {
              const key =
                `${item.originalId}_per_avg` as keyof DonutGraphDataType;
              return {
                ...item,
                value: res[key],
              };
            }),
          );
        })
        .catch((err) => console.log(err));
      getAllEmotionTimeData()
        .then((res) => {
          setEmotionTimeData(res);
        })
        .catch((err) => console.log(err));
    }
  }, [is_sign_in]);

  const PAST_TENSE_LABELS: Record<EmotionType, string> = {
    happy: '즐거웠어요',
    sad: '슬펐어요',
    surprise: '놀랐어요',
    angry: '화났어요',
    neutral: '평온했어요',
  };

  return (
    <>
      <div className="my-page-container">
        {!is_verify_email_done && (
          <section
            className="verify-alert-banner"
            role="alert"
            aria-live="polite">
            <p className="banner-text">
              원활한 서비스 이용을 위해 이메일 인증을 진행해주세요.
            </p>
            <button
              type="button"
              className="banner-action"
              onClick={handleVerifyEmailClick}
              aria-label="이메일 인증 진행하기">
              인증하기
            </button>
          </section>
        )}
        <div className="my-page-user-container">
          <div className="my-page-user-info-container">
            <div className="my-page-profile-image-container">
              <ProfileIcon
                type={isMobile ? 'icon-medium' : 'icon-large'}
                color={mapNumberToEmotion(user_profile)}
              />
              {is_verify_email_done && (
                <span
                  className="verify-badge"
                  role="img"
                  aria-label="이메일 인증 완료된 계정입니다."
                  title="이메일 인증 완료"></span>
              )}
            </div>
            <div className="my-page-user-edit-container">
              <div className="my-page-name-container">
                <div className="my-page-name-wrapper">
                  <h2
                    className={
                      isMobile
                        ? 'my-page-username font-title-medium'
                        : 'my-page-username font-title-large'
                    }
                    style={{ display: 'flex', alignItems: 'center' }}>
                    {user_name}님
                  </h2>
                  <SomeIcon
                    type={isMobile ? 'small-next' : 'large-next'}
                    onClick={() => navigate('/edit')}
                  />
                </div>
                <h3
                  className={
                    isMobile ? 'font-title-mini' : 'font-title-medium'
                  }>
                  오늘은 어떤 기분이신가요?
                </h3>
              </div>
              {!isMobile && (
                <Button
                  label="로그아웃"
                  variant="small-outline"
                  onClick={handleLogoutClick}
                  style={{
                    marginBottom: '40px',
                  }}
                />
              )}
            </div>
          </div>
          <Devider />
        </div>

        <div className="my-page-watched-contents-container">
          <div className="my-page-watched-title-container">
            <h3
              className={
                isMobile
                  ? 'my-page-title font-title-small'
                  : 'my-page-title font-title-medium'
              }>
              최근 본 영상
            </h3>
            <div className="my-page-chip-container">
              <div className="my-page-chip-wrapper">
                {['all', ...EMOTIONS].map((emotion) => (
                  <Chip
                    key={emotion}
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={emotion as 'all' | EmotionType}
                    onClick={() =>
                      handleChipClick(emotion as 'all' | EmotionType)
                    }
                    isSelected={selectedEmotion === emotion}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="my-page-video-container">
            <div className="my-page-video-wrapper">
              {filteredRecentVideos.length > 0 ? (
                filteredRecentVideos.map((v) => (
                  <div
                    className="recent-video-item"
                    key={`videoItem${v.youtube_url}${v.most_emotion_per}`}>
                    <VideoItem
                      type="big-emoji"
                      key={`videoItem${v.youtube_url}${v.most_emotion_per}`}
                      width={isMobile ? window.innerWidth - 32 : 360}
                      videoId={v.youtube_url}
                      videoUuid={v.video_id}
                      videoTitle={v.title}
                      videoMostEmotion={v.most_emotion}
                      videoMostEmotionPercentage={v.most_emotion_per}
                      style={
                        isMobile
                          ? { paddingTop: '14px', paddingBottom: '14px' }
                          : { marginRight: '60px' }
                      }
                      hoverToPlay={false}
                    />
                    <div className="video-graph-container">
                      <ResponsiveLine
                        data={v.distribution_data.graph_data}
                        colors={EMOTIONS.map((e) => EMOTION_COLORS[e])}
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
                        legends={[]}
                        tooltip={() => <></>}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="my-page-video-empty">
                  <img
                    className="my-page-video-empty-img"
                    src={Etc}
                    alt="etc"
                  />
                  <p
                    className={
                      isMobile ? 'font-lebel-medium' : 'font-label-large'
                    }>
                    아직 본 영상이 없어요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="my-page-emotion-container">
          <h2 className={isMobile ? 'font-title-small' : 'font-title-medium'}>
            나의 감정 그래프
          </h2>
          <div className="my-page-emotion-graph-container">
            <div className="pie-graph-container">
              <ResponsivePie
                colors={EMOTIONS.map((e) => EMOTION_COLORS[e])}
                data={donutGraphData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 0.2]],
                }}
                innerRadius={0.7}
                enableArcLabels={false}
                enableArcLinkLabels={false}
                tooltip={() => <></>}
              />
              <div className="pie-legend-container">
                {donutGraphData.map((item) => (
                  <div key={item.originalId} className="legend-item-wrapper">
                    <div
                      className={`legend-item-color ${item.originalId}`}></div>
                    <div className="legend-item-text font-label-large">
                      {item.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="emotion-time-container">
              <h3 className="font-title-large emotion-time-title">
                그동안
                <br />
                영상을 보며
              </h3>
              <div className="text-wrapper">
                {EMOTIONS.map((emotion) => (
                  <p key={emotion} className="emotion-time-text">
                    <span className={`highlight ${emotion}`}>
                      {emotionTimeData[emotion]}
                    </span>
                    초 {PAST_TENSE_LABELS[emotion]} {EMOTION_EMOJIS[emotion]}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalDialog
        type="two-button"
        name="email-verification"
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerificationCode('');
        }}
        onCheck={handleVerifyCodeSubmit}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h3
            className="font-title-large"
            style={{
              marginTop: '0',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700',
            }}>
            이메일 인증
          </h3>
          <p
            className="font-body-large"
            style={{
              marginTop: '0',
              marginBottom: '40px',
              color: '#A0A0A0',
              lineHeight: '1.6',
              fontSize: '15px',
            }}>
            가입하신 이메일로 6자리 인증 코드가 발송되었습니다.
            <br />
            수신된 메일을 확인하여 코드를 입력해주세요.
          </p>
          <TextInput
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6자리 코드"
            maxLength={6}
            aria-label="6자리 인증 코드"
            style={{
              width: '100%',
              maxWidth: '280px',
              margin: '0 auto',
              textAlign: 'center',
              letterSpacing: '8px',
              backgroundColor: '#2A2A36',
              border: '1px solid #4B4B5C',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFFFFF',
            }}
          />
        </div>
      </ModalDialog>
    </>
  );
};

export default MyPage;

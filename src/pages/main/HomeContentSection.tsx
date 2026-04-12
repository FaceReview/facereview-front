import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getAllVideo,
  getPersonalRecommendedVideo,
  getVideoList,
} from 'api/youtube';
import VideoItem from 'components/VideoItem/VideoItem';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useAuthStorage } from 'store/authStore';
import { EmotionType } from 'types';
import VideoCarousel from 'components/VideoCarousel/VideoCarousel';

import { updateRequestVideoList } from 'api/request';
import youtubeIcon from 'assets/img/youtubeIcon.png';
import Button from 'components/Button/Button';
import Chip from 'components/Chip/Chip';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import VideoCardSkeleton from 'components/Skeleton/VideoCardSkeleton';
import SomeIcon from 'components/SomeIcon/SomeIcon';
import TextInput from 'components/TextInput/TextInput';
import { CATEGORIES, CATEGORY_ITEMS, EMOTIONS } from 'constants/index';
import { useLocation } from 'react-router-dom';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import useMediaQuery from 'hooks/useMediaQuery';

const HomeContentSection = (): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const { is_sign_in, user_name } = useAuthStorage();

  const [selectedEmotion, setSelectedEmotion] = useState<'all' | EmotionType>(
    'all',
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerInput, setRegisterInput] = useState('');
  const [registeredVideoIds, setRegisteredVideoIds] = useState<string[]>([]);

  // React Query: personal recommended videos
  const { data: personalRecommendedVideo = [] } = useQuery({
    queryKey: ['personalRecommended'],
    queryFn: () => getPersonalRecommendedVideo(),
    enabled: is_sign_in,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // React Query: infinite scroll for all videos
  const {
    data: allVideoData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['allVideos', selectedEmotion],
    queryFn: ({ pageParam = 1 }) =>
      getAllVideo({ page: pageParam, size: 20, emotion: selectedEmotion }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const allVideo = useMemo(
    () => allVideoData?.pages.flatMap((page) => page) || [],
    [allVideoData],
  );

  // Fetch ALL category data
  const { data: allCategoryList = [] } = useQuery({
    queryKey: ['videos', 'all'],
    queryFn: () => getVideoList(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [genreCurrentIndex, setGenreCurrentIndex] = useState<number>(0);

  const currentGenreVideos =
    allCategoryList.find(
      (category) => category.category_name === CATEGORIES[genreCurrentIndex],
    )?.videos || [];

  const genreTitle: Array<string> = CATEGORY_ITEMS.map((item) => item.label);

  const handleGenrePrev = () => {
    setGenreCurrentIndex((prev) =>
      prev === 0 ? CATEGORIES.length - 1 : prev - 1,
    );
  };
  const handleGenreNext = () => {
    setGenreCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
  };

  const getThumbnailUrl = (videoId: string) =>
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  const handleChipClick = (emotion: 'all' | EmotionType) => {
    if (selectedEmotion !== emotion) {
      setSelectedEmotion(emotion);
    }
  };

  const openModal = () => {
    document.body.style.overflow = 'hidden';
    setIsModalOpen(true);
  };
  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setIsModalOpen(false);
    setRegisterInput('');
    setRegisteredVideoIds([]);
  };

  const extractVideoId = (input: string): string | null => {
    const match = input.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    return match?.[1] ?? null;
  };

  const handleRegisterButtonClick = () => {
    if (registeredVideoIds.length > 0) {
      registeredVideoIds.map((videoId) =>
        updateRequestVideoList({ youtube_url: videoId })
          .then(() => {})
          .catch((error) => {
            console.log(error);
          }),
      );
    }
  };

  const location = useLocation();

  // Derive videoId from registerInput or URL code parameter (no useEffect needed)
  const { registeringVideoId, isRegisterMatched } = useMemo(() => {
    // Priority: registerInput > URL code parameter
    const source =
      registerInput ||
      (is_sign_in && location.search.includes('code')
        ? location.search.split('=')[1] || ''
        : '');

    const videoId = extractVideoId(source);
    return {
      registeringVideoId: videoId || '',
      isRegisterMatched: !!videoId,
    };
  }, [registerInput, is_sign_in, location.search]);

  // Intersection Observer for infinite scroll
  const onIntersect: IntersectionObserverCallback = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const { targetRef } = useIntersectionObserver({
    onIntersect,
  });

  return (
    <>
      {/* ... Personal Rec ... */}
      {is_sign_in ? (
        <div className="personal-recommend-contents-container">
          <h2
            className={
              isMobile ? 'title font-title-medium' : 'title font-title-large'
            }>
            {user_name}님이 좋아할{` `} {isMobile && <br />}
            오늘의 영상들을 골라봤어요.
          </h2>
          <h3
            className={
              isMobile
                ? 'subtitle font-title-mini'
                : 'subtitle font-title-small'
            }>
            시청 기록과 감정을 분석해서{` `}
            {isMobile && <br />}
            가장 좋아할 영상을 준비했어요.
          </h3>
          <div className="video-container">
            <div className="genre-video-container">
              <VideoCarousel videos={personalRecommendedVideo} />
            </div>
          </div>
        </div>
      ) : null}

      {/* ... Genre ... */}
      <div className="genre-contents-container">
        <div className="genre-title-row">
          <h2
            className={
              isMobile ? 'title font-title-medium' : 'title font-title-large'
            }>
            {genreTitle[genreCurrentIndex]} 추천{` `}
            {isMobile && <br />}
            영상을 골라봤어요.
          </h2>
          <div className="genre-nav-buttons">
            <button
              type="button"
              className="genre-nav-btn"
              onClick={handleGenrePrev}
              aria-label="이전 장르">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="genre-nav-btn"
              onClick={handleGenreNext}
              aria-label="다음 장르">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <h3
          className={
            isMobile ? 'subtitle font-title-mini' : 'subtitle font-title-small'
          }>
          유저들의 감정데이터를 분석해{` `}
          {isMobile && <br />}
          추천 영상을 준비했어요.
        </h3>
        <div className="genre-video-container">
          <VideoCarousel videos={currentGenreVideos} />
        </div>
      </div>

      <div className="hot-contents-container">
        <h2
          className={
            isMobile ? 'title font-title-medium' : 'title font-title-large'
          }>
          {is_sign_in ? (
            <div>
              {`${user_name}님을 위해 준비한 `}
              {isMobile && <br />}
              인기있는 영상이에요.
            </div>
          ) : (
            <div>
              감정별로 볼 수 있는{` `}
              {isMobile && <br />}
              영상을 추천해드릴게요.
            </div>
          )}
        </h2>
        <div className="video-container">
          <div className="main-page-chip-container">
            <div className="chip-wrapper">
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
                    isMobile ? { marginRight: '12px' } : { marginRight: '24px' }
                  }
                />
              ))}
              <Chip
                type={isMobile ? 'category-small' : 'category-big'}
                choose={'plus'}
                onClick={openModal}
                style={
                  isMobile ? { marginRight: '12px' } : { marginRight: '24px' }
                }
              />
            </div>
          </div>
          <ModalDialog isOpen={isModalOpen} onClose={closeModal}>
            <div className="video-register-modal-container">
              <SomeIcon
                type={'close'}
                style={{ position: 'absolute', top: '20px', right: '20px' }}
                onClick={closeModal}
              />
              <h2 className="main-page-modal-title font-title-medium">
                맞춤형 영상을 추천해드릴게요.
                <br />
                재미있게 본 영상을 추가해주세요.
              </h2>
              <div className="main-page-modal-input-container">
                <p className="main-page-modal-input-label font-title-mini">
                  영상 링크를 첨부해주세요
                </p>
                <div className="main-page-modal-input-wrapper">
                  <TextInput
                    value={registerInput}
                    variant="underline"
                    onChange={(e) => setRegisterInput(e.target.value)}
                    placeholder={
                      'ex) https://www.youtube.com/watch?v=3rfONMofiho…'
                    }
                  />
                </div>
              </div>
              <div className="main-page-modal-thumbnail-container">
                {isRegisterMatched ? (
                  <img
                    className="main-page-modal-thumbnail-registering"
                    src={getThumbnailUrl(registeringVideoId)}
                    alt="등록할 영상 썸네일"
                  />
                ) : (
                  <div className="main-page-modal-thumbnail-empty">
                    <img
                      className="main-page-modal-thumbnail-empty-image"
                      src={youtubeIcon}
                      alt="youtubeIcon"
                    />
                  </div>
                )}

                {registeredVideoIds.map((v, i) => (
                  <img
                    key={v || i}
                    className="main-page-modal-thumbnail-registered"
                    src={getThumbnailUrl(v)}
                    alt="등록된 영상 썸네일"
                  />
                ))}
              </div>
              <Button
                label={''}
                variant={'add'}
                aria-label="영상 추가"
                style={{ position: 'absolute', bottom: '128px' }}
                onClick={() => {
                  setRegisteredVideoIds((prevIds) => [
                    ...prevIds,
                    registeringVideoId,
                  ]);
                  setRegisterInput('');
                }}
                disabled={!isRegisterMatched}
              />
              <div className="video-register-modal-button-wrapper">
                <Button
                  label={'확인'}
                  variant={'cta-full'}
                  onClick={() => {
                    handleRegisterButtonClick();
                    closeModal();
                  }}
                />
              </div>
            </div>
          </ModalDialog>

          <div className="video-wrapper">
            {allVideo.map((v, i) => (
              <VideoItem
                type="small-emoji"
                key={v.youtube_url || i}
                width={isMobile ? window.innerWidth - 32 : 280}
                videoId={v.youtube_url}
                videoUuid={v.uuid ?? v.id ?? v.video_id}
                videoTitle={v.title}
                videoMostEmotion={v.dominant_emotion}
                videoMostEmotionPercentage={v.dominant_emotion_per}
                style={
                  isMobile
                    ? { marginTop: '14px', marginBottom: '14px' }
                    : {
                        marginRight: (i + 1) % 4 === 0 ? 0 : '26px',
                        marginBottom: '56px',
                      }
                }
              />
            ))}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <VideoCardSkeleton
                    key={`skeleton-${i}`}
                    width={isMobile ? window.innerWidth - 32 : 280}
                    style={
                      isMobile
                        ? { marginTop: '14px', marginBottom: '14px' }
                        : {
                            marginRight: (i + 1) % 4 === 0 ? 0 : '26px',
                            marginBottom: '56px',
                          }
                    }
                  />
                ))}
              </>
            )}
            {isFetchingNextPage && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <VideoCardSkeleton
                    key={`more-skeleton-${i}`}
                    width={isMobile ? window.innerWidth - 32 : 280}
                    style={
                      isMobile
                        ? { marginTop: '14px', marginBottom: '14px' }
                        : {
                            marginRight: (i + 1) % 4 === 0 ? 0 : '26px',
                            marginBottom: '56px',
                          }
                    }
                  />
                ))}
              </>
            )}
            <div ref={targetRef} style={{ width: '100%', height: '20px' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeContentSection;

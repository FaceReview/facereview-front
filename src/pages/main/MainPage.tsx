import { ReactElement, useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from 'components/Spinner/Spinner';
import { useAuthStorage } from 'store/authStore';
import VideoItem from 'components/VideoItem/VideoItem';
import './mainpage.scss';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllVideo,
  getVideoList,
  getPersonalRecommendedVideo,
  searchVideos,
} from 'api/youtube';
import { EmotionType, VideoDataType } from 'types';

import Chip from 'components/Chip/Chip';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import TextInput from 'components/TextInput/TextInput';
import { useLocation, useSearchParams } from 'react-router-dom';
import youtubeIcon from 'assets/img/youtubeIcon.png';
import Button from 'components/Button/Button';
import SomeIcon from 'components/SomeIcon/SomeIcon';
import { updateRequestVideoList } from 'api/request';
import useMediaQuery from 'utils/useMediaQuery';
import useIntersectionObserver from 'utils/useIntersectionObserver';
import { CATEGORIES, CATEGORY_ITEMS } from 'constants/index';

const MainPage = (): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [keyword, setKeyword] = useState(searchQuery || '');

  useEffect(() => {
    setKeyword(searchQuery || '');
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () =>
      searchVideos({
        page: 1,
        size: 20,
        keyword_type: 'title',
        keyword: searchQuery || '',
      }),
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ q: keyword });
    } else {
      setSearchParams({});
    }
  };

  const { is_sign_in, user_name } = useAuthStorage();
  const [selectedEmotion, setSelectedEmotion] = useState<'all' | EmotionType>(
    'all',
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerInput, setRegisterInput] = useState('');
  const [registeringVideoId, setRegisteringVideoId] = useState('');
  const [registeredVideoIds, setRegisteredVideoIds] = useState<string[]>([]);
  const [isRegisterMatched, setIsRegisterMatched] = useState(false);

  // Infinite Scroll items
  const [allVideo, setAllVideo] = useState<VideoDataType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [personalRecommendedVideo, serPersonalRecommendedVideo] = useState<
    VideoDataType[]
  >([]);

  // React Query Integration
  const queryClient = useQueryClient();
  const [genreCurrentIndex, setGenreCurrentIndex] = useState<number>(0);
  const currentCategory = CATEGORIES[genreCurrentIndex];

  // Fetch current category data
  const { data: categoryList = [] } = useQuery({
    queryKey: ['videos', currentCategory],
    queryFn: () => getVideoList(currentCategory),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const currentGenreVideos = categoryList[0]?.videos || [];

  // Pre-fetch next genre
  useEffect(() => {
    const nextIndex = (genreCurrentIndex + 1) % CATEGORIES.length;
    const nextCategory = CATEGORIES[nextIndex];
    queryClient.prefetchQuery({
      queryKey: ['videos', nextCategory],
      queryFn: () => getVideoList(nextCategory),
      staleTime: 1000 * 60 * 5,
    });
  }, [genreCurrentIndex, queryClient]);

  const [genreChangeTerm, setGenreChangeTerm] = useState<number | null>(6000);
  const [genreChangeOpacity, setGenreChangeOpacity] = useState<number>(1);
  const genreTitle: Array<string> = CATEGORY_ITEMS.map((item) => item.label);

  const getThumbnailUrl = (videoId: string) =>
    `http://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  const handleChipClick = (emotion: 'all' | EmotionType) => {
    if (selectedEmotion !== emotion) {
      setSelectedEmotion(emotion);
      setPage(1);
      setAllVideo([]);
      setHasMore(true);
    }
  };

  const openModal = () => {
    document.body.style.overflow = 'hidden';
    setIsModalOpen(true);
  };
  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setIsModalOpen(false);
    setIsRegisterMatched(false);
    setRegisterInput('');
    setRegisteringVideoId('');
    setRegisteredVideoIds([]);
  };

  const extractVideoId = useCallback(
    (input?: string) => {
      const target = input || registerInput;
      const match = target.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      );

      if (match && match[1]) {
        setRegisteringVideoId(match[1]);
        setIsRegisterMatched(true);
      } else {
        setIsRegisterMatched(false);
      }
    },
    [registerInput],
  );
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

  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const intervalTimer = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const useInterval = (
    callback: () => void,
    delay: number | null,
    index: number,
  ) => {
    const savedCallback = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      const tick = () => {
        setGenreChangeOpacity(1);
        if (savedCallback.current) {
          savedCallback.current();
        }
      };

      if (delay !== null) {
        timeoutTimer.current = setTimeout(() => {
          setGenreChangeOpacity(0);
        }, 5800);
        intervalTimer.current = setInterval(tick, delay);
        return () => {
          clearInterval(intervalTimer.current);
          clearTimeout(timeoutTimer.current);
        };
      }
    }, [delay, index]);
  };

  useInterval(
    () => {
      setGenreCurrentIndex((prevIndex) => (prevIndex + 1) % CATEGORIES.length);
    },
    genreChangeTerm,
    genreCurrentIndex,
  );

  const location = useLocation();

  useEffect(() => {
    if (is_sign_in && location.search.includes('code')) {
      const code = location.search.split('=')[1];
      extractVideoId(code);
    }
  }, [is_sign_in, location, extractVideoId]);

  // Infinite Scroll Effect
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const SIZE = 20;
        const data = await getAllVideo({
          page,
          size: SIZE,
          emotion: selectedEmotion,
        });

        if (data.length < SIZE) {
          setHasMore(false);
        }

        setAllVideo((prev) => {
          if (page === 1) return data;
          return [...prev, ...data];
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [page, selectedEmotion]);

  // Intersection Observer
  const onIntersect: IntersectionObserverCallback = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasMore && !isLoading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, isLoading],
  );

  const { targetRef } = useIntersectionObserver({
    onIntersect,
  });

  // Removed manual fetching logic (fetchingRef, fetchGenreVideoObj, initial load effects) replaced by React Query above

  /* Removed original Promise.all effect */
  useEffect(() => {
    if (is_sign_in) {
      getPersonalRecommendedVideo()
        .then((res) => {
          serPersonalRecommendedVideo(res);
        })
        .catch((err) => {
          console.log(
            'ERROR /home/user-customized-list ----------------------',
            err,
          );
        });
    }
  }, [is_sign_in]);

  useEffect(() => {
    extractVideoId();
  }, [extractVideoId, registerInput]);

  return (
    <div className="main-page-container">
      <div
        className="search-section"
        style={{
          marginBottom: '56px',
          padding: isMobile ? '0' : '0',
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: isMobile ? '0px' : '0px', // Reduced to 0
        }}>
        <form
          onSubmit={handleSearch}
          style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
          <TextInput
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="찾고 싶은 영상을 검색해보세요"
            variant="default"
            style={{
              width: '100%',
              borderRadius: '100px',
              paddingRight: '50px',
              height: '52px',
              fontSize: '16px',
              border: '1px solid #32323f',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0a1ac"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </div>

      {searchQuery ? (
        <div
          className="search-results-container"
          style={{ padding: isMobile ? '0 16px' : '0' }}>
          <h2
            className={
              isMobile ? 'title font-title-medium' : 'title font-title-large'
            }
            style={{ marginBottom: '20px' }}>
            '{searchQuery}' 검색 결과
          </h2>
          <div className="video-container">
            <div className="video-wrapper">
              {isSearchLoading ? (
                <Spinner />
              ) : searchResults?.videos?.length ? (
                searchResults.videos.map((v, i) => (
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
                        ? { marginBottom: '24px' }
                        : { marginRight: '28px', marginBottom: '56px' }
                    }
                  />
                ))
              ) : (
                <div
                  style={{
                    color: 'white', // Note: Title color is gray-900 (blackish), but "No results" was white. Keeping original.
                    padding: '40px 0',
                    textAlign: 'center',
                    width: '100%',
                  }}
                  className="font-title-medium">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ... Personal Rec ... */}
          {is_sign_in ? (
            <div className="personal-recommend-contents-container">
              <h2
                className={
                  isMobile
                    ? 'title font-title-medium'
                    : 'title font-title-large'
                }>
                {user_name}님이 좋아할{` `} {isMobile && <br />}
                오늘의 영상들을 골라봤어요.
              </h2>
              <h4
                className={
                  isMobile
                    ? 'subtitle font-title-mini'
                    : 'subtitle font-title-small'
                }>
                시청 기록과 감정을 분석해서{` `}
                {isMobile && <br />}
                가장 좋아할 영상을 준비했어요.
              </h4>
              <div className="video-container">
                <div className="main-page-video-container">
                  <div className="main-page-video-wrapper">
                    {personalRecommendedVideo.map((v, i) => (
                      <VideoItem
                        type="small-emoji"
                        key={v.youtube_url || i}
                        width={isMobile ? window.innerWidth - 48 : 280}
                        videoId={v.youtube_url}
                        videoUuid={v.uuid ?? v.id ?? v.video_id}
                        videoTitle={v.title}
                        videoMostEmotion={v.dominant_emotion}
                        videoMostEmotionPercentage={v.dominant_emotion_per}
                        style={
                          isMobile
                            ? {
                                marginTop: '14px',
                                marginBottom: '14px',
                                marginRight: '16px',
                              }
                            : { marginRight: '28px' }
                        }
                        hoverToPlay={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ... Genre ... */}
          <div className="genre-contents-container">
            <h2
              className={
                isMobile ? 'title font-title-medium' : 'title font-title-large'
              }>
              <span
                style={{
                  opacity: genreChangeOpacity,
                  transition: 'opacity 0.2s ease-in-out',
                }}>
                {genreTitle[genreCurrentIndex]}
              </span>{' '}
              추천{` `}
              {isMobile && <br />}
              영상을 골라봤어요.
            </h2>
            <h4
              className={
                isMobile
                  ? 'subtitle font-title-mini'
                  : 'subtitle font-title-small'
              }>
              유저들의 감정데이터를 분석해{` `}
              {isMobile && <br />}
              추천 영상을 준비했어요.
            </h4>
            <div
              onMouseEnter={() => {
                clearInterval(intervalTimer.current);
                clearTimeout(timeoutTimer.current);
                setGenreChangeTerm(null);
              }}
              onMouseLeave={() => setGenreChangeTerm(6000)}
              style={{
                opacity: genreChangeOpacity,
                transition: 'opacity 0.2s ease-in-out',
              }}
              className="genre-video-container">
              <div className="main-page-genre-video-container">
                <div className="main-page-genre-video-wrapper">
                  {currentGenreVideos.map((v) => (
                    <VideoItem
                      type="small-emoji"
                      key={uuidv4()}
                      width={isMobile ? window.innerWidth - 48 : 280}
                      videoId={v.youtube_url}
                      videoUuid={v.uuid ?? v.id ?? v.video_id}
                      videoTitle={v.title}
                      videoMostEmotion={v.dominant_emotion}
                      videoMostEmotionPercentage={v.dominant_emotion_per}
                      style={
                        isMobile
                          ? {
                              marginTop: '14px',
                              marginBottom: '14px',
                              marginRight: '16px',
                            }
                          : {
                              marginRight: '28px',
                            }
                      }
                    />
                  ))}
                </div>
              </div>
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
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'all'}
                    onClick={() => handleChipClick('all')}
                    isSelected={selectedEmotion === 'all'}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'happy'}
                    onClick={() => handleChipClick('happy')}
                    isSelected={selectedEmotion === 'happy'}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'surprise'}
                    onClick={() => handleChipClick('surprise')}
                    isSelected={selectedEmotion === 'surprise'}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'sad'}
                    onClick={() => handleChipClick('sad')}
                    isSelected={selectedEmotion === 'sad'}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'angry'}
                    onClick={() => handleChipClick('angry')}
                    isSelected={selectedEmotion === 'angry'}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                  <Chip
                    type={isMobile ? 'category-small' : 'category-big'}
                    choose={'plus'}
                    onClick={openModal}
                    style={
                      isMobile
                        ? { marginRight: '12px' }
                        : { marginRight: '24px' }
                    }
                  />
                </div>
              </div>
              <ModalDialog
                type={'one-button'}
                name="video-register-modal"
                isOpen={isModalOpen}
                onClose={closeModal}
                onCheck={handleRegisterButtonClick}>
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
                        'ex) https://www.youtube.com/watch?v=3rfONMofiho'
                      }
                    />
                  </div>
                </div>
                <div className="main-page-modal-thumbnail-container">
                  {isRegisterMatched ? (
                    <img
                      className="main-page-modal-thumbnail-registering"
                      src={getThumbnailUrl(registeringVideoId)}
                      alt=""
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
                      alt=""
                    />
                  ))}
                </div>
                <Button
                  label={''}
                  variant={'add'}
                  style={{ position: 'absolute', bottom: '128px' }}
                  onClick={() => {
                    setRegisteredVideoIds((prevIds) => [
                      ...prevIds,
                      registeringVideoId,
                    ]);
                    setRegisterInput('');
                    setRegisteringVideoId('');
                    setIsRegisterMatched(false);
                  }}
                  disabled={!isRegisterMatched}
                />
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
                        : { marginRight: '28px', marginBottom: '56px' }
                    }
                  />
                ))}
                <div
                  ref={targetRef}
                  style={{ width: '100%', height: '20px' }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;

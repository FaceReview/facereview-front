import { ReactElement, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchVideos } from 'api/youtube';
import VideoItem from 'components/VideoItem/VideoItem';
import VideoCardSkeleton from 'components/Skeleton/VideoCardSkeleton';
import useMediaQuery from 'utils/useMediaQuery';
import useIntersectionObserver from 'utils/useIntersectionObserver';

type SearchResultsSectionProps = {
  query: string;
};

const SearchResultsSection = ({
  query,
}: SearchResultsSectionProps): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['search', query],
      queryFn: ({ pageParam = 1 }) =>
        searchVideos({
          page: pageParam,
          size: 20,
          keyword_type: 'title',
          keyword: query,
        }),
      getNextPageParam: (lastPage) => {
        return lastPage.has_next ? lastPage.page + 1 : undefined;
      },
      enabled: !!query,
      initialPageParam: 1,
    });

  const videos = useMemo(() => {
    return data?.pages.flatMap((page) => page.videos) || [];
  }, [data]);

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
    <div
      className="search-results-container"
      style={{ padding: isMobile ? '0 16px' : '0' }}>
      <h2
        className={
          isMobile ? 'title font-title-medium' : 'title font-title-large'
        }
        style={{ marginBottom: '20px' }}>
        '{query}' 검색 결과
      </h2>
      <div className="video-container">
        <div className="video-wrapper">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <VideoCardSkeleton
                  key={`search-loading-${i}`}
                  width={isMobile ? window.innerWidth - 32 : 280}
                  style={
                    isMobile
                      ? { marginBottom: '24px' }
                      : { marginRight: '28px', marginBottom: '56px' }
                  }
                />
              ))}
            </>
          ) : videos.length > 0 ? (
            <>
              {videos.map((v, i) => (
                <VideoItem
                  type="small-emoji"
                  key={`${v.youtube_url}-${i}`}
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
              ))}
              {isFetchingNextPage && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <VideoCardSkeleton
                      key={`search-more-${i}`}
                      width={isMobile ? window.innerWidth - 32 : 280}
                      style={
                        isMobile
                          ? { marginBottom: '24px' }
                          : { marginRight: '28px', marginBottom: '56px' }
                      }
                    />
                  ))}
                </>
              )}
              <div ref={targetRef} style={{ width: '100%', height: '20px' }} />
            </>
          ) : (
            <div
              style={{
                color: 'white',
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
  );
};

export default SearchResultsSection;

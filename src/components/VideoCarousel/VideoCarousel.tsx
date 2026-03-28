import { ReactElement } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './VideoCarousel.scss';

import useMediaQuery from 'hooks/useMediaQuery';
import VideoItem from 'components/VideoItem/VideoItem';
import { SwiperOptions } from 'swiper/types';

interface VideoCarouselProps {
  videos: any[];
  hoverToPlay?: boolean;
  renderItem?: (video: any, index: number) => React.ReactNode;

  // 자동 여백 계산을 위한 디멘션 설정
  desktopSlidesPerView?: number;  // 한 줄에 보여줄 아이템 개수 (기본 4)
  desktopItemWidth?: number;      // 아이템 가로 픽셀 (기본 280)
  desktopContainerWidth?: number; // 부모 컨테이너 가로 픽셀 (기본 1200)
}

const VideoCarousel = ({
  videos,
  hoverToPlay = true,
  renderItem,
  desktopSlidesPerView = 4,
  desktopItemWidth = 280,
  desktopContainerWidth = 1200,
}: VideoCarouselProps): ReactElement | null => {
  const isMobile = useMediaQuery('(max-width: 1200px)');

  if (!videos || videos.length === 0) return null;

  // 컨테이너 폭에서 아이템들이 차지하는 영역을 뺀 남는 공간을 여백 개수로 나눔 (완벽한 symmetry gap 도출)
  const desktopSpaceBetween =
    desktopSlidesPerView > 1
      ? (desktopContainerWidth - desktopItemWidth * desktopSlidesPerView) /
        (desktopSlidesPerView - 1)
      : 0;

  const dynamicBreakpoints: SwiperOptions['breakpoints'] = {
    0: {
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 28, // 모바일 기본 간격
    },
    1200: {
      slidesPerView: desktopSlidesPerView,
      slidesPerGroup: desktopSlidesPerView,
      spaceBetween: desktopSpaceBetween,
    },
  };

  return (
    <div className="video-carousel-container">
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true, enabled: !isMobile }}
        navigation={{ enabled: isMobile }}
        watchOverflow={false}
        allowTouchMove={false}
        breakpoints={dynamicBreakpoints}
        style={
          {
            paddingTop: '20px',
            paddingBottom: '24px',
            paddingLeft: isMobile ? '16px' : '20px',
            paddingRight: isMobile ? '16px' : '20px',
            marginLeft: isMobile ? '-16px' : '-20px',
            marginRight: isMobile ? '0px' : '-20px',
            '--swiper-pagination-bottom': '0px',
            '--swiper-pagination-color': '#76FECE', // 활성 점 (포인트 컬러)
            '--swiper-pagination-bullet-inactive-color': '#76FECE', // 비활성 점 (동일 통일감 부여)
            '--swiper-pagination-bullet-inactive-opacity': '0.4', // 불투명도로만 구분
            '--swiper-pagination-bullet-size': '10px',
            '--swiper-pagination-bullet-horizontal-gap': '6px',
            '--swiper-navigation-color': '#76FECE', // 모바일 네비게이션 화살표 컬러
            '--swiper-navigation-size': '18px', // 원형 내부에 맞게 화살표 크기 축소 (여백감 부여)
          } as React.CSSProperties
        }
      >
        {videos.map((v, i) => (
          <SwiperSlide key={v.uuid ?? v.id ?? v.video_id ?? i}>
            {renderItem ? (
              renderItem(v, i)
            ) : (
              <VideoItem
                type="small-emoji"
                width={isMobile ? window.innerWidth - 32 : 280}
                videoId={v.youtube_url}
                videoUuid={v.uuid ?? v.id ?? v.video_id}
                videoTitle={v.title}
                videoMostEmotion={v.dominant_emotion}
                videoMostEmotionPercentage={v.dominant_emotion_per}
                style={
                  isMobile
                    ? { marginTop: '14px', marginBottom: '14px' }
                    : { marginBottom: '56px' }
                }
                hoverToPlay={hoverToPlay}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default VideoCarousel;

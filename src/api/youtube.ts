import {
  VideoRelatedType,
  VideoWatchedType,
  YoutubeVideoDataType,
  EmotionSummaryResponse,
  VideoDataType,
  VideoDetailType,
  SearchVideoResponse,
} from 'types';
import api, { youtubeApi } from './index';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? '';

export const getVideoList = async (category?: string) => {
  const url = `/v2/home/category`;
  const params = category ? { category_name: category } : {};
  const { data } = await api.get<
    {
      category_name: string;
      videos: VideoDataType[];
    }[]
  >(url, { params });

  return data || [];
};

export const searchVideos = async (props: {
  page: number;
  size: number;
  keyword_type: string;
  keyword: string;
}) => {
  const url = '/v2/home/search';
  const { data } = await api.get<SearchVideoResponse>(url, {
    params: props,
  });
  return data;
};

export const getAllVideo = async (props: {
  page: number;
  size: number;
  emotion: string;
}) => {
  const url = '/v2/home/video/all';
  const { data } = await api.get<{ videos: VideoDataType[] }>(url, {
    params: props,
  });

  if (!data || !data.videos) {
    console.warn(
      'getAllVideo: Expected object with videos array but got:',
      data,
    );
    return [];
  }

  return data.videos;
};

export const getPersonalRecommendedVideo = async () => {
  const url = '/v2/home/personalized';
  const { data } = await api.get<VideoDataType[]>(url);

  return data;
};

export const getVideoDetail = async (props: { video_id: string }) => {
  const url = '/v2/watch/video';
  const { data } = await api.get<VideoDetailType>(url, { params: props });

  return data;
};

export const getRecentVideo = async (props?: {
  page?: number;
  size?: number;
  emotion?: string;
}) => {
  const url = '/v2/mypage/videos/recent';
  const { data } = await api.get<{ videos: VideoWatchedType[] }>(url, {
    params: props,
  });

  return data.videos ?? [];
};

export const getEmotionSummary = async () => {
  const url = '/v2/mypage/emotion/summary';
  const { data } = await api.get<EmotionSummaryResponse>(url);

  return data;
};

export const getRelatedVideo = async (props: { video_id: string }) => {
  const url = '/v2/watch/recommended';
  const { data } = await api.get<{ videos: VideoRelatedType[] }>(url, {
    params: props,
  });

  return data.videos ?? [];
};

export const getDataFromYoutube = async (props: { youtube_url: string }) => {
  const { data } = await youtubeApi.get<YoutubeVideoDataType>(
    '/youtube/v3/videos',
    {
      params: {
        part: 'snippet,contentDetails',
        id: props.youtube_url,
        key: YOUTUBE_API_KEY,
      },
    },
  );

  return data;
};

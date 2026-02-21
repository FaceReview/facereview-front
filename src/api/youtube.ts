import {
  VideoRelatedType,
  VideoWatchedType,
  YoutubeVideoDataType,
  EmotionSummaryResponse,
  VideoDataType,
  VideoDetailType,
  EmotionType,
} from 'types';
import api, { youtubeApi } from './index';

export const getVideoList = async (category?: string) => {
  try {
    const url = `/v2/home/category`;
    const params = category ? { category_name: category } : {};
    const { data } = await api.get<
      {
        category_name: string;
        videos: VideoDataType[];
      }[]
    >(url, { params });

    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const searchVideos = async (props: {
  page: number;
  size: number;
  keyword_type: string;
  keyword: string;
}) => {
  try {
    const url = '/v2/home/search';
    const { data } = await api.get<import('types').SearchVideoResponse>(url, {
      params: props,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllVideo = async (props: {
  page: number;
  size: number;
  emotion: string;
}) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPersonalRecommendedVideo = async () => {
  try {
    const url = '/v2/home/personalized';
    const { data } = await api.get<VideoDataType[]>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getVideoDetail = async (props: { video_id: string }) => {
  try {
    const url = '/v2/watch/video';
    const { data } = await api.get<VideoDetailType>(url, { params: props });

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRecentVideo = async (props?: {
  page?: number;
  size?: number;
  emotion?: string;
}) => {
  try {
    const url = '/v2/mypage/videos/recent';
    const { data } = await api.get<{ videos: VideoWatchedType[] }>(url, {
      params: props,
    });

    return data.videos;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getEmotionSummary = async () => {
  try {
    const url = '/v2/mypage/emotion/summary';
    const { data } = await api.get<EmotionSummaryResponse>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRelatedVideo = async (props: { video_id: string }) => {
  try {
    const url = '/v2/watch/recommended';
    const { data } = await api.get<{ videos: VideoRelatedType[] }>(url, {
      params: props,
    });

    return data.videos;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDataFromYoutube = async (props: { youtube_url: string }) => {
  try {
    const url = `/youtube/v3/videos?part=snippet&part=contentDetails&id=${props.youtube_url}&key=AIzaSyAva4KgvWU_2Yjcz9g7Q8csTNzHYUc1KNM`;
    const { data } = await youtubeApi.get<YoutubeVideoDataType>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

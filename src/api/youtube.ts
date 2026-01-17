import {
  DonutGraphDataType,
  EmotionType,
  VideoDataType,
  VideoDetailType,
  VideoRelatedType,
  VideoWatchedType,
  YoutubeVideoDataType,
} from 'types';
import api, { youtubeApi } from './index';

const getVideoList = async (category: string) => {
  try {
    const url = `/v2/home/category`;
    const { data } = await api.get<
      { category_name: string; videos: VideoDataType[] }[]
    >(url);
    const categoryData = data.find((c) => c.category_name === category);
    return categoryData ? categoryData.videos : [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSportsVideo = () => getVideoList('sports');
export const getGameVideo = () => getVideoList('game');
export const getFearVideo = () => getVideoList('fear');
export const getInformationVideo = () => getVideoList('information');
export const getShowVideo = () => getVideoList('show');
export const getCookVideo = () => getVideoList('cook');
export const getTravelVideo = () => getVideoList('travel');
export const getEatingVideo = () => getVideoList('eating');
export const getDramaVideo = () => getVideoList('drama');

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

export const getDounutGraphData = async () => {
  try {
    const url = '/mypage/donut-data';
    const { data } = await api.get<DonutGraphDataType>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllEmotionTimeData = async () => {
  try {
    const url = '/mypage/all-emotion-num';
    const { data } = await api.get<{ [key in EmotionType]: number }>(url);

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

import { CommentType, VideoDetailType, VideoDistributionDataType } from "types";
import api from "./index";

export const getVideoComments = async (props: { youtube_url: string }) => {
  try {
    const url = "/watch/comment-list";
    const { data } = await api.post<CommentType[]>(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const sendNewComment = async (props: {
  comment_contents: string;
  youtube_url: string;
}) => {
  try {
    const url = "/watch/add-comment";
    const { data } = await api.post<VideoDetailType>(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const sendFinishVideo = async (props: {
  watching_data_index: number;
}) => {
  try {
    const url = "/finish-watch";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getMainDistributionData = async (props: {
  youtube_url: string;
}) => {
  try {
    const url = "/watch/main-distribution-data";
    const { data } = await api.post<VideoDistributionDataType>(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addHits = async (props: {
  youtube_url: string;
  user_categorization: string;
}) => {
  try {
    const url = "/watch/update-hits";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addLike = async (props: { youtube_url: string }) => {
  try {
    const url = "/watch/add-like";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const cancelLike = async (props: { youtube_url: string }) => {
  try {
    const url = "/watch/cancel-like";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const checkLike = async (props: { youtube_url: string }) => {
  try {
    const url = "/watch/check-like";
    const { data } = await api.post<{ like_flag: number }>(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const modifyComment = async (props: {
  comment_index: number;
  new_comment_contents: string;
}) => {
  try {
    const url = "/watch/modify-comment";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteComment = async (props: { comment_index: number }) => {
  try {
    const url = "/watch/delete-comment";
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

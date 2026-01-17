import { CommentType } from 'types';
import api from './index';

export const getVideoComments = async (props: { video_id: string }) => {
  try {
    const url = '/v2/watch/comments';
    const { data } = await api.get<CommentType[]>(url, { params: props });

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const sendNewComment = async (props: {
  content: string;
  video_id: string;
}) => {
  try {
    const url = '/v2/watch/comments';
    const { data } = await api.post<{
      comment_id: string;
      message: string;
    }>(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addLike = async (props: { video_id: string }) => {
  try {
    const url = '/v2/watch/like';
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const cancelLike = async (props: { video_id: string }) => {
  try {
    const url = '/v2/watch/like';
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const modifyComment = async (props: {
  comment_id: string;
  content: string;
}) => {
  try {
    const url = '/v2/watch/comments';
    const { data } = await api.patch(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteComment = async (props: { comment_id: string }) => {
  try {
    const url = '/v2/watch/comments';
    const { data } = await api.delete(url, { params: props });

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

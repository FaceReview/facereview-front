import { CommentType } from 'types';
import api from './index';

export const getVideoComments = async (props: { video_id: string }) => {
  const url = '/v2/watch/comments';
  const { data } = await api.get<{
    comments: CommentType[];
    total: number;
  }>(url, { params: props });

  return data.comments || [];
};

export const sendNewComment = async (props: {
  content: string;
  video_id: string;
}) => {
  const url = '/v2/watch/comments';
  const { data } = await api.post<{
    comment_id: string;
    message: string;
  }>(url, props);

  return data;
};

export const addLike = async (props: { video_id: string }) => {
  const url = '/v2/watch/like';
  const { data } = await api.post(url, props);

  return data;
};

export const cancelLike = async (props: { video_id: string }) => {
  // Same endpoint as addLike — backend toggles like state per video.
  const url = '/v2/watch/like';
  const { data } = await api.post(url, props);

  return data;
};

export const modifyComment = async (props: {
  comment_id: string;
  content: string;
}) => {
  const url = '/v2/watch/comments';
  const { data } = await api.patch(url, props);

  return data;
};

export const deleteComment = async (props: { comment_id: string }) => {
  const url = '/v2/watch/comments';
  const { data } = await api.delete(url, { params: props });

  return data;
};

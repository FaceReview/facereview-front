import { RequestedVideoType } from 'types/index';
import api from './index';

export const getRequestedVideoList = async () => {
  const url = '/v2/admin/video-requests';
  const { data } = await api.get<RequestedVideoType[]>(url);

  return data;
};

export const updateRequestVideoList = async (props: {
  youtube_url_list: string[];
}) => {
  const url = '/v2/home/video/recommend';
  const { data } = await api.post<{
    result?: string;
    message?: string;
  }>(url, props);

  return data;
};

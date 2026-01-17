import { ReqeustedVideoType } from 'types/index';
import api from './index';

export const getRequestedVideoList = async () => {
  try {
    const url = '/v2/admin/video-requests';
    const { data } = await api.get<ReqeustedVideoType[]>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateRequestVideoList = async (props: {
  youtube_url: string;
}) => {
  try {
    const url = '/v2/home/video/recommend';
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

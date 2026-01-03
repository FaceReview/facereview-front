import { ReqeustedVideoType } from 'types/index';
import api from './index';

export const getRequestedVideoList = async () => {
  try {
    const url = '/register/recommend-list';
    const { data } = await api.get<ReqeustedVideoType[]>(url);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateRequestVideoList = async (props: {
  youtube_url_id: string;
}) => {
  try {
    const url = '/register/recommend-register';
    const { data } = await api.post(url, props);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

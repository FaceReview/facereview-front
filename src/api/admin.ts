import api from './index';

export const approveVideoRequest = async (props: {
  request_id: string;
  category: string;
}) => {
  const url = `/v2/admin/video-requests/${props.request_id}/approve`;
  const { data } = await api.post(url, { category: props.category });

  return data;
};

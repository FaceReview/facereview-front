import api from './index';

// 이메일 인증 번호 발송
export const sendEmailVerification = async () => {
  try {
    const url = '/v2/mypage/email/verification';
    const res = await api.post(url);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 이메일 인증 번호 확인
export const verifyEmailCode = async (props: { code: string }) => {
  try {
    const url = '/v2/mypage/email/verify';
    const res = await api.post(url, props);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

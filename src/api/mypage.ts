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

// 비밀번호 재설정 인증 코드 확인
export const verifyPasswordCode = async (props: { code: string }) => {
  try {
    const url = '/v2/mypage/password/verification';
    const res = await api.post<{ reset_token: string; message?: string }>(
      url,
      props,
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 비밀번호 변경 (재설정)
export const changePassword = async (props: {
  reset_token: string;
  new_password: string;
}) => {
  try {
    const url = '/v2/mypage/password';
    const res = await api.patch(url, props);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

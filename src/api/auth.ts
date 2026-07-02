import {
  EmailCheckResponse,
  LoginResponse,
  UpdateProfileRequest,
  UserResponse,
} from 'types';
import api from './index';

export const checkEmail = async (props: { email: string }) => {
  const url = '/v2/auth/check-email';
  const res = await api.post<EmailCheckResponse>(url, {
    email: props.email,
  });

  return res;
};

export const signIn = async (props: { email: string; password: string }) => {
  const url = '/v2/auth/login';
  const res = await api.post<LoginResponse>(url, {
    email: props.email,
    password: props.password,
  });

  return res;
};

export const signUp = async (props: {
  email: string;
  password: string;
  name: string;
  favorite_genres: string[];
}) => {
  const url = '/v2/auth/signup';
  const res = await api.post<LoginResponse>(url, props);

  return res;
};

/** Mark the current user's tutorial as complete. */
export const completeTutorial = async () => {
  const url = '/v2/auth/tutorial';
  const res = await api.patch(url);

  return res;
};

/** @deprecated Use {@link completeTutorial} instead. */
export const checkTutorial = completeTutorial;
/** @deprecated Use {@link completeTutorial} instead. */
export const tutorialComplete = completeTutorial;

export const getUserName = async () => {
  const url = '/v2/auth/me';
  const res = await api.get<UserResponse>(url);

  return res;
};

export const updateProfile = async (props: UpdateProfileRequest) => {
  const url = '/v2/mypage/profile';
  const res = await api.patch(url, props);

  return res;
};

export const refreshToken = async () => {
  const url = '/v2/auth/reissue';
  const res = await api.post<{
    access_token: string;
  }>(url);

  return res;
};

export const signOut = async () => {
  const url = '/v2/auth/logout';
  const res = await api.post(url);

  return res;
};

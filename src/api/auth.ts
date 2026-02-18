import {
  EmailCheckResponse,
  LoginResponse,
  UpdateProfileRequest,
  UserResponse,
} from 'types';
import api from './index';

export const checkEmail = async (props: { email: string }) => {
  try {
    const url = '/v2/auth/check-email';
    const res = await api.post<EmailCheckResponse>(url, {
      email: props.email,
    });

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signIn = async (props: { email: string; password: string }) => {
  try {
    const url = '/v2/auth/login';
    const res = await api.post<LoginResponse>(url, {
      email: props.email,
      password: props.password,
    });

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signUp = async (props: {
  email: string;
  password: string;
  name: string;
  favorite_genres: string[];
}) => {
  try {
    const url = '/v2/auth/signup';
    const res = await api.post<LoginResponse>(url, props);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const checkTutorial = async () => {
  try {
    const url = '/v2/auth/tutorial';
    const res = await api.patch(url);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const tutorialComplete = async () => {
  try {
    const url = '/v2/auth/tutorial';
    const res = await api.patch(url);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserName = async () => {
  try {
    const url = '/v2/auth/me';
    const res = await api.get<UserResponse>(url);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateProfile = async (props: UpdateProfileRequest) => {
  try {
    const url = '/v2/mypage/profile';
    const res = await api.patch(url, props);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const url = '/v2/auth/reissue';
    const res = await api.post<{
      access_token: string;
    }>(url);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const url = '/v2/auth/logout';
    const res = await api.post(url);

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

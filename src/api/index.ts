import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const MAX_RETRY_COUNT = 3;

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount > MAX_RETRY_COUNT) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      try {
        const { refreshToken } = await import('./auth');
        const { useAuthStorage } = await import('store/authStore');
        const HeaderToken = (await import('./HeaderToken')).default;

        const { data } = await refreshToken();
        const { access_token } = data;

        // Update Token
        useAuthStorage.getState().setToken({
          access_token,
        });
        HeaderToken.set(access_token);

        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/',
  timeout: 30000,
});

youtubeApi.interceptors.request.use(
  (config) => {
    // console.log("🔮 [Req config]", config, "\n");
    return config;
  },
  (error) => {
    // console.log("🧨 [Req ERROR]", error, "\n");
    return Promise.reject(error);
  },
);

youtubeApi.interceptors.response.use(
  (response) => {
    // console.log("🔮 [Res]", response, "\n");
    return response;
  },
  (error) => {
    // console.log("🧨 [Res ERROR]", error, "\n");
    if (error.status === 408) {
      // noop
    }
    return Promise.reject(error);
  },
);

export default api;

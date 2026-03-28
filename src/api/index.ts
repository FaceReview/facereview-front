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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/v2/auth/reissue')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      isRefreshing = true;

      if (originalRequest._retryCount > MAX_RETRY_COUNT) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        processQueue(error, null);
        isRefreshing = false;
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

        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

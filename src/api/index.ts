import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // console.log("🔮 [Req config]", config, "\n");
    return config;
  },
  (error) => {
    // console.log("🧨 [Req ERROR]", error, "\n");
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
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

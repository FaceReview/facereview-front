import api from 'api';

export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Backwards-compatible default export for existing call sites.
const HeaderToken = {
  set: setAuthToken,
};

export default HeaderToken;

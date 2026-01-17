import api from 'api';

export default class HeaderToken {
  public static set = (token: string | null): void => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  };
}

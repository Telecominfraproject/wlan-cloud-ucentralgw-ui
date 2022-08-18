import * as axios from 'axios';
import axiosRetry from 'axios-retry';
import { LOGOUT_ON_SEC_ERROR_CODES } from 'constants';

const axiosInstance = axios.create();

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: () => axiosRetry.exponentialDelay,
});

axiosInstance.defaults.timeout = 160000;
axiosInstance.defaults.headers.get.Accept = 'application/json';
axiosInstance.defaults.headers.post.Accept = 'application/json';

axiosInstance.interceptors.response.use(
  // Success actions
  undefined,
  (error) => {
    switch (error.response.status) {
      case 401:
        break;
      case 403:
        if (error.response.data?.ErrorCode === 13) {
          let retries = localStorage.getItem('sec_retries')
            ? +localStorage.getItem('sec_retries')
            : 0;
          retries += 1;
          localStorage.setItem('sec_retries', retries);
        }
        if (LOGOUT_ON_SEC_ERROR_CODES.includes(error.response.data?.ErrorCode)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('gateway_endpoints');
          sessionStorage.clear();
          window.location.href = '/';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

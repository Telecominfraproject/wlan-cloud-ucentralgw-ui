import * as axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create();

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: () => axiosRetry.exponentialDelay,
});

axiosInstance.defaults.timeout = 60000;
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
        if (error.response.data?.ErrorCode === 9) {
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

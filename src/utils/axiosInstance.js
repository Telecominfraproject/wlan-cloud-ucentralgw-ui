import * as axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create();

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return axiosRetry.exponentialDelay;
  },
});

axiosInstance.defaults.headers.get.Accept = 'application/json';
axiosInstance.defaults.headers.post.Accept = 'application/json';

axiosInstance.interceptors.request.use((config) => {
  const newConfig = config;
  const url = sessionStorage.getItem('gw_url');
  if (url !== undefined && url !== null && !newConfig.url.includes(url)) {
    newConfig.url = url + newConfig.url;
  }
  return newConfig;
});

axiosInstance.interceptors.response.use(
  // Success actions
  undefined,
  (error) => {
    console.log(error);
    switch (error.response.status) {
      case 401:
        console.log(`Error 401 ${error}`);
        break;
      case 403:
        console.log(`Error 403 ${error}`);
        sessionStorage.clear();
        window.location.href = '/';
        break;
      default:
        console.log(`Default ${error.response.status}`);
        break;
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

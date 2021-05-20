import * as axios from 'axios';
import axiosRetry from 'axios-retry';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true});
const axiosInstance = axios.create(
  httpAgent,
  httpsAgent
);

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: () => axiosRetry.exponentialDelay,
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
    switch (error.response.status) {
      case 401:
        break;
      case 403:
        sessionStorage.clear();
        window.location.href = '/';
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

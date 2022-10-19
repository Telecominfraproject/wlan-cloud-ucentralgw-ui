import * as axios from 'axios';
import { AUTH_EXPIRED_TOKEN_CODE, AUTH_INVALID_TOKEN_CODE } from './apiErrors';
import { AxiosError } from 'models/Axios';

export const secUrl = `${
  // @ts-ignore
  window?._env_?.REACT_APP_UCENTRALSEC_URL || import.meta.env.VITE_UCENTRALSEC_URL
}/api/v1`;

const sec = axios.default.create({ baseURL: secUrl });

sec.defaults.timeout = 120000;
sec.defaults.headers.get.Accept = 'application/json';
sec.defaults.headers.post.Accept = 'application/json';

sec.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const prov = axios.default.create({ baseURL: secUrl });

prov.defaults.timeout = 120000;
prov.defaults.headers.get.Accept = 'application/json';
prov.defaults.headers.post.Accept = 'application/json';

prov.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const gw = axios.default.create({ baseURL: secUrl });

gw.defaults.timeout = 120000;
gw.defaults.headers.get.Accept = 'application/json';
gw.defaults.headers.post.Accept = 'application/json';

gw.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const fms = axios.default.create({ baseURL: secUrl });

fms.defaults.timeout = 120000;
fms.defaults.headers.get.Accept = 'application/json';
fms.defaults.headers.post.Accept = 'application/json';

fms.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const sub = axios.default.create({ baseURL: secUrl });

sub.defaults.timeout = 120000;
sub.defaults.headers.get.Accept = 'application/json';
sub.defaults.headers.post.Accept = 'application/json';

sub.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const owls = axios.default.create({ baseURL: secUrl });

owls.defaults.timeout = 120000;
owls.defaults.headers.get.Accept = 'application/json';
owls.defaults.headers.post.Accept = 'application/json';

owls.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const analytics = axios.default.create({ baseURL: secUrl });

analytics.defaults.timeout = 120000;
analytics.defaults.headers.get.Accept = 'application/json';
analytics.defaults.headers.post.Accept = 'application/json';

analytics.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const installer = axios.default.create({ baseURL: secUrl });

installer.defaults.timeout = 120000;
installer.defaults.headers.get.Accept = 'application/json';
installer.defaults.headers.post.Accept = 'application/json';

installer.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

const rrm = axios.default.create({ baseURL: secUrl });

rrm.defaults.timeout = 120000;
rrm.defaults.headers.get.Accept = 'application/json';
rrm.defaults.headers.post.Accept = 'application/json';

rrm.interceptors.response.use(
  // Success actions
  undefined,
  (error: AxiosError) => {
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        if (
          error.response.data?.ErrorCode === AUTH_EXPIRED_TOKEN_CODE ||
          error.response.data?.ErrorCode === AUTH_INVALID_TOKEN_CODE
        ) {
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.href = 'login';
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

export const axiosProv = prov;
export const axiosSec = sec;
export const axiosGw = gw;
export const axiosFms = fms;
export const axiosSub = sub;
export const axiosOwls = owls;
export const axiosAnalytics = analytics;
export const axiosInstaller = installer;
export const axiosRrm = rrm;

import axiosInstance from './axiosInstance';

export const logout = (token, endpoint) => {
  axiosInstance
    .delete(`${endpoint}/api/v1/oauth2/${token}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {})
    .catch(() => {})
    .finally(() => {
      sessionStorage.clear();
      window.location.replace('/');
    });
};

export const getToken = () => {
  const token = sessionStorage.getItem('access_token');
  if (token === undefined || token === null) {
    logout();
    return null;
  }
  return token;
};

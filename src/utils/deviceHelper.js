import axiosInstance from 'utils/axiosInstance';

export default async (deviceId, token) => {
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  return axiosInstance
    .get(`/device/${encodeURIComponent(deviceId)}/status`, options)
    .then((response) => response.data.connected)
    .catch(() => false);
};

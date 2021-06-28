import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';

export default async (deviceId) => {
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  };

  return axiosInstance
    .get(`/device/${encodeURIComponent(deviceId)}/status`, options)
    .then((response) => response.data.connected)
    .catch(() => false);
};

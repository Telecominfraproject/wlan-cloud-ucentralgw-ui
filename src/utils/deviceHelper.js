import axiosInstance from 'utils/axiosInstance';

export default async (deviceId, token, endpoint) => {
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  return axiosInstance
    .get(`${endpoint}/api/v1/device/${encodeURIComponent(deviceId)}/status`, options)
    .then((response) => response.data.connected)
    .catch(() => false);
};

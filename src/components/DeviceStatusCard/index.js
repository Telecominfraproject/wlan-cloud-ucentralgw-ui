import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { DeviceStatusCard as Card, useDevice, useAuth } from 'ucentral-libs';

const DeviceStatusCard = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [lastStats, setLastStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getData = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const lastStatsRequest = axiosInstance.get(
      `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(
        deviceSerialNumber,
      )}/statistics?lastOnly=true`,
      options,
    );
    const statusRequest = axiosInstance.get(
      `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/status`,
      options,
    );

    Promise.all([lastStatsRequest, statusRequest])
      .then(([newStats, newStatus]) => {
        setLastStats(newStats.data);
        setStatus(newStatus.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setError(false);
    if (deviceSerialNumber) getData();
  }, [deviceSerialNumber]);

  return (
    <Card
      t={t}
      loading={loading}
      error={error}
      deviceSerialNumber={deviceSerialNumber}
      getData={getData}
      status={status}
      lastStats={lastStats}
    />
  );
};

export default DeviceStatusCard;

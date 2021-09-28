import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { DeviceStatusCard as Card, useDevice, useAuth, useToast } from 'ucentral-libs';

const DeviceStatusCard = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const { addToast } = useToast();
  const [lastStats, setLastStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [deviceConfig, setDeviceConfig] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDevice = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}`, options)
      .then((response) => {
        setDeviceConfig(response.data);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_device', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      });
  };

  const getData = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const lastStatsRequest = axiosInstance.get(
      `${endpoints.owgw}/api/v1/device/${encodeURIComponent(
        deviceSerialNumber,
      )}/statistics?lastOnly=true`,
      options,
    );
    const statusRequest = axiosInstance.get(
      `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/status`,
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

  const refresh = () => {
    getData();
    getDevice();
  };

  useEffect(() => {
    setError(false);
    if (deviceSerialNumber) {
      getDevice();
      getData();
    }
  }, [deviceSerialNumber]);

  return (
    <Card
      t={t}
      loading={loading}
      error={error}
      deviceSerialNumber={deviceSerialNumber}
      getData={refresh}
      deviceConfig={deviceConfig}
      status={status}
      lastStats={lastStats}
    />
  );
};

export default DeviceStatusCard;

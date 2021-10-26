import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CRow, CCol, CCard, CCardBody, CNav, CNavLink, CTabPane, CTabContent } from '@coreui/react';
import DeviceHealth from 'components/DeviceHealth';
import CommandHistory from 'components/CommandHistory';
import DeviceLogs from 'components/DeviceLogs';
import DeviceStatisticsCard from 'components/InterfaceStatistics';
import DeviceActionCard from 'components/DeviceActionCard';
import axiosInstance from 'utils/axiosInstance';
import { DeviceProvider, DeviceStatusCard, DeviceDetails, useAuth, useToast } from 'ucentral-libs';
import { useTranslation } from 'react-i18next';

const DevicePage = () => {
  const { t } = useTranslation();
  const { deviceId } = useParams();
  const [index, setIndex] = useState(0);
  const { currentToken, endpoints } = useAuth();
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
      .get(`${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceId)}`, options)
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
      `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceId)}/statistics?lastOnly=true`,
      options,
    );
    const statusRequest = axiosInstance.get(
      `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceId)}/status`,
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
    if (deviceId) {
      getDevice();
      getData();
    }
  }, [deviceId]);

  return (
    <div className="App">
      <DeviceProvider axiosInstance={axiosInstance} serialNumber={deviceId}>
        <CRow>
          <CCol lg="12" xl="6">
            <DeviceStatusCard
              t={t}
              loading={loading}
              error={error}
              deviceSerialNumber={deviceId}
              getData={refresh}
              deviceConfig={deviceConfig}
              status={status}
              lastStats={lastStats}
            />
          </CCol>
          <CCol lg="12" xl="6">
            <DeviceActionCard />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CCard>
              <CCardBody className="p-0">
                <CNav variant="tabs">
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 0}
                    onClick={() => setIndex(0)}
                  >
                    {t('statistics.title')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 1}
                    onClick={() => setIndex(1)}
                  >
                    {t('common.details')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 2}
                    onClick={() => setIndex(2)}
                  >
                    {t('commands.title')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 3}
                    onClick={() => setIndex(3)}
                  >
                    {t('health.title')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 4}
                    onClick={() => setIndex(4)}
                  >
                    {t('device_logs.title')}
                  </CNavLink>
                </CNav>
                <CTabContent>
                  <CTabPane active={index === 0}>
                    <DeviceStatisticsCard />
                  </CTabPane>
                  <CTabPane active={index === 1}>
                    <DeviceDetails
                      t={t}
                      loading={loading}
                      getData={refresh}
                      deviceConfig={deviceConfig}
                      status={status}
                      lastStats={lastStats}
                    />
                  </CTabPane>
                  <CTabPane active={index === 2}>
                    <CommandHistory />
                  </CTabPane>
                  <CTabPane active={index === 3}>
                    <DeviceHealth />
                  </CTabPane>
                  <CTabPane active={index === 4}>
                    <DeviceLogs />
                  </CTabPane>
                </CTabContent>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </DeviceProvider>
    </div>
  );
};

export default DevicePage;

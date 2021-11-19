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
import ConfigurationDisplay from 'components/ConfigurationDisplay';
import WifiAnalysis from 'components/WifiAnalysis';
import CapabilitiesDisplay from 'components/CapabilitiesDisplay';
import NotesTab from './NotesTab';

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

    let deviceInfo = null;

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceId)}`, options)
      .then((response) => {
        deviceInfo = response.data;

        if (response.data.venue !== '' || (response.data.owner !== '' && endpoints.owprov)) {
          return axiosInstance.get(
            `${endpoints.owprov}/api/v1/inventory/${encodeURIComponent(
              deviceId,
            )}?withExtendedInfo=true`,
            options,
          );
        }

        setDeviceConfig(deviceInfo);
        return null;
      })
      .then((response) => {
        if (response) setDeviceConfig({ ...deviceInfo, extendedInfo: response.data.extendedInfo });
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
                    active={index === 5}
                    onClick={() => setIndex(5)}
                  >
                    {t('configuration.title')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 8}
                    onClick={() => setIndex(8)}
                  >
                    {t('device.capabilities')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 7}
                    onClick={() => setIndex(7)}
                  >
                    {t('configuration.notes')}
                  </CNavLink>
                  <CNavLink
                    className="font-weight-bold"
                    href="#"
                    active={index === 6}
                    onClick={() => setIndex(6)}
                  >
                    {t('wifi_analysis.title')}
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
                    {index === 0 ? <DeviceStatisticsCard /> : null}
                  </CTabPane>
                  <CTabPane active={index === 1}>
                    {index === 1 ? (
                      <DeviceDetails
                        t={t}
                        loading={loading}
                        getData={refresh}
                        deviceConfig={deviceConfig}
                        status={status}
                        lastStats={lastStats}
                      />
                    ) : null}
                  </CTabPane>
                  <CTabPane active={index === 5}>
                    {index === 5 ? (
                      <ConfigurationDisplay deviceConfig={deviceConfig} getData={refresh} />
                    ) : null}
                  </CTabPane>
                  <CTabPane active={index === 8}>
                    {index === 8 ? <CapabilitiesDisplay serialNumber={deviceId} /> : null}
                  </CTabPane>
                  <CTabPane active={index === 6}>{index === 6 ? <WifiAnalysis /> : null}</CTabPane>
                  <CTabPane active={index === 7}>
                    {index === 7 ? (
                      <NotesTab deviceConfig={deviceConfig} refresh={refresh} />
                    ) : null}
                  </CTabPane>
                  <CTabPane active={index === 2}>
                    {index === 2 ? <CommandHistory /> : null}
                  </CTabPane>
                  <CTabPane active={index === 3}>{index === 3 ? <DeviceHealth /> : null}</CTabPane>
                  <CTabPane active={index === 4}>{index === 4 ? <DeviceLogs /> : null}</CTabPane>
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

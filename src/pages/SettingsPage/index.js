import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiStatusCard } from 'ucentral-libs';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'utils/axiosInstance';
import { CRow, CCol } from '@coreui/react';
import { prettyDate, secondsToDetailed } from 'utils/helper';

const initialEndpoint = {
  uptime: '',
  version: '',
  start: '',
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [gateway, setGateway] = useState(initialEndpoint);
  const [fms, setFms] = useState(initialEndpoint);
  const [sec, setSec] = useState(initialEndpoint);

  const getEndpointInfo = (endpoint, setInfo, title) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const getUptime = axiosInstance.get(`${endpoint}/api/v1/system?command=times`, options);
    const getVersion = axiosInstance.get(`${endpoint}/api/v1/system?command=version`, options);

    Promise.all([getUptime, getVersion])
      .then(([newUptime, newVersion]) => {
        const uptimeObj = newUptime.data.times.find((obj) => obj.tag === 'uptime');
        const startObj = newUptime.data.times.find((obj) => obj.tag === 'start');
        setInfo({
          title,
          endpoint,
          uptime: uptimeObj?.value
            ? secondsToDetailed(
                uptimeObj.value,
                t('common.day'),
                t('common.days'),
                t('common.hour'),
                t('common.hours'),
                t('common.minute'),
                t('common.minutes'),
                t('common.second'),
                t('common.seconds'),
              )
            : t('common.unknown'),
          version: newVersion.data.value,
          start: prettyDate(startObj.value),
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    getEndpointInfo(endpoints.ucentralgw, setGateway, 'uCentralGW');
    getEndpointInfo(endpoints.ucentralsec, setSec, 'uCentralSec');
    getEndpointInfo(endpoints.ucentralfms, setFms, 'uCentralFms');
  }, []);

  return (
    <CRow>
      <CCol sm="4">
        <ApiStatusCard t={t} info={sec} />
      </CCol>
      <CCol sm="4">
        <ApiStatusCard t={t} info={gateway} />
      </CCol>
      <CCol sm="4">
        <ApiStatusCard t={t} info={fms} />
      </CCol>
    </CRow>
  );
};

export default SettingsPage;

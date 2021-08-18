import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiStatusCard, useAuth, useToast } from 'ucentral-libs';
import { v4 as createUuid } from 'uuid';
import axiosInstance from 'utils/axiosInstance';
import { CRow, CCol } from '@coreui/react';
import { prettyDate, secondsToDetailed } from 'utils/helper';

const SystemPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [endpointsInfo, setEndpointsInfo] = useState([]);

  const getSystemInfo = async (key, endpoint) => {
    const systemInfo = {
      title: key,
      endpoint,
      uptime: t('common.unknown'),
      version: t('common.unknown'),
      start: t('common.unknown'),
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const getUptime = axiosInstance.get(`${endpoint}/api/v1/system?command=times`, options);
    const getVersion = axiosInstance.get(`${endpoint}/api/v1/system?command=version`, options);

    return Promise.all([getUptime, getVersion])
      .then(([newUptime, newVersion]) => {
        const uptimeObj = newUptime.data.times.find((obj) => obj.tag === 'uptime');
        const startObj = newUptime.data.times.find((obj) => obj.tag === 'start');
        return {
          title: key,
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
        };
      })
      .catch(() => {
        throw new Error('Error while fetching');
      })
      .finally(() => systemInfo);
  };

  const getAllInfo = async () => {
    const promises = [];

    for (const [key, value] of Object.entries(endpoints)) {
      promises.push(getSystemInfo(key, value));
    }

    try {
      const results = await Promise.all(promises);
      setEndpointsInfo(results);
    } catch {
      addToast({
        title: t('common.error'),
        body: t('system.error_fetching'),
        color: 'danger',
        autohide: true,
      });
    }
  };

  useEffect(() => {
    getAllInfo();
  }, []);

  return (
    <CRow>
      {endpointsInfo.map((info) => (
        <CCol key={createUuid()} md="4">
          <ApiStatusCard t={t} info={info} />
        </CCol>
      ))}
    </CRow>
  );
};

export default SystemPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiStatusCard, useAuth, useToast } from 'ucentral-libs';
import { v4 as createUuid } from 'uuid';
import axiosInstance from 'utils/axiosInstance';
import { CRow, CCol } from '@coreui/react';
import { secondsToDetailed } from 'utils/helper';

const SystemPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [endpointsInfo, setEndpointsInfo] = useState([]);

  const getSystemInfo = async (key, endpoint) => {
    const systemInfo = {
      title: key,
      endpoint,
      hostname: t('common.unknown'),
      os: t('common.unknown'),
      processors: t('common.unknown'),
      uptime: t('common.unknown'),
      version: t('common.unknown'),
      certificates: [],
      subsystems: [],
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const getInfo = axiosInstance.get(`${endpoint}/api/v1/system?command=info`, options);
    const getSubsystems = axiosInstance.post(
      `${endpoint}/api/v1/system`,
      { command: 'getsubsystemnames' },
      options,
    );

    return Promise.all([getInfo, getSubsystems])
      .then(([newInfo, newSubs]) => {
        let newSystem = { ...systemInfo };
        newSystem = { ...newSystem, ...newInfo.data, ...newSubs.data };
        newSystem.uptime = secondsToDetailed(
          newInfo.data.uptime,
          t('common.day'),
          t('common.days'),
          t('common.hour'),
          t('common.hours'),
          t('common.minute'),
          t('common.minutes'),
          t('common.second'),
          t('common.seconds'),
        );
        newSystem.start = newInfo.data.start;
        newSystem.subsystems = newSubs.data.list.sort((a, b) => {
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        });

        return newSystem;
      })
      .catch(() => systemInfo);
  };

  const reload = (subsystems, endpoint) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const parameters = {
      command: 'reload',
      subsystems,
    };

    axiosInstance
      .post(`${endpoint}/api/v1/system?command=info`, parameters, options)
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('system.success_reload'),
          color: 'success',
          autohide: true,
        });
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('system.error_reloading', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      });
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
        <CCol sm="12" lg="6" xxl="4" key={createUuid()}>
          <ApiStatusCard t={t} info={info} reload={reload} />
        </CCol>
      ))}
    </CRow>
  );
};

export default SystemPage;

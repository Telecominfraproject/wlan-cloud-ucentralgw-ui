import React, { useEffect, useState } from 'react';
import DeviceList from 'components/DeviceListTable';
import DeviceDashboard from 'components/DeviceDashboard';
import BlacklistTable from 'components/BlacklistTable';
import {
  CCard,
  CCardBody,
  CNav,
  CNavLink,
  CTabPane,
  CTabContent,
  CCardHeader,
} from '@coreui/react';
import { useTranslation } from 'react-i18next';

const DeviceListPage = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const updateNav = (target) => {
    sessionStorage.setItem('devicePage', target);
    setIndex(target);
  };

  useEffect(() => {
    const target = sessionStorage.getItem('devicePage');

    if (target !== null) setIndex(parseInt(target, 10));
  }, []);

  return (
    <CCard>
      <CCardHeader className="dark-header">
        <div className="text-value-lg mr-auto">{t('common.devices')}</div>
      </CCardHeader>
      <CCardBody className="p-0">
        <CNav variant="tabs">
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 0}
            onClick={() => updateNav(0)}
          >
            {t('common.dashboard')}
          </CNavLink>
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 1}
            onClick={() => updateNav(1)}
          >
            {t('common.all')}
          </CNavLink>
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 2}
            onClick={() => updateNav(2)}
          >
            {t('common.blacklist')}
          </CNavLink>
        </CNav>
        <CTabContent>
          <CTabPane active={index === 0}>{index === 0 ? <DeviceDashboard /> : null}</CTabPane>
          <CTabPane active={index === 1}>{index === 1 ? <DeviceList /> : null}</CTabPane>
          <CTabPane active={index === 2}>{index === 2 ? <BlacklistTable /> : null}</CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  );
};

export default DeviceListPage;

import React, { useState } from 'react';
import DeviceList from 'components/DeviceListTable';
import DeviceDashboard from 'components/DeviceDashboard';
import { CCard, CCardBody, CNav, CNavLink, CTabPane, CTabContent } from '@coreui/react';
import { useTranslation } from 'react-i18next';

const DeviceListPage = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  return (
    <CCard>
      <CCardBody className="p-0">
        <CNav variant="tabs">
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 0}
            onClick={() => setIndex(0)}
          >
            {t('common.dashboard')}
          </CNavLink>
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 1}
            onClick={() => setIndex(1)}
          >
            {t('common.devices')}
          </CNavLink>
        </CNav>
        <CTabContent>
          <CTabPane active={index === 0}>
            <DeviceDashboard />
          </CTabPane>
          <CTabPane active={index === 1}>
            <DeviceList />
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  );
};

export default DeviceListPage;

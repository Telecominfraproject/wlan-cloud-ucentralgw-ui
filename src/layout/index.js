import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import routes from 'routes';
import { CSidebarNavItem } from '@coreui/react';
import { cilBarcode, cilRouter, cilSave, cilSettings, cilPeople } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { Header, Footer, PageContainer, ToastProvider, useAuth } from 'ucentral-libs';
import { WebSocketProvider } from 'contexts/WebSocketProvider';
import Sidebar from './Sidebar';
import SidebarDevices from './Devices';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');
  const { endpoints, currentToken, user, avatar, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [newConnectionData, setNewConnectionData] = useState();

  const onConnectionDataChange = React.useCallback((newData) => {
    setNewConnectionData({ ...newData });
  }, []);

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        logo="assets/OpenWiFi_LogoLockup_WhiteColour.svg"
        options={
          <>
            <CSidebarNavItem
              className="font-weight-bold"
              name={t('common.devices')}
              to="/devices"
              icon={<CIcon content={cilRouter} size="xl" className="mr-3" />}
            />
            <CSidebarNavItem
              className="font-weight-bold"
              name={t('firmware.title')}
              to="/firmware"
              icon={<CIcon content={cilSave} size="xl" className="mr-3" />}
            />
            <CSidebarNavItem
              className="font-weight-bold"
              name={t('configuration.default_configs')}
              to="/defaultconfigurations"
              icon={<CIcon content={cilBarcode} size="xl" className="mr-3" />}
            />
            <CSidebarNavItem
              className="font-weight-bold"
              name={t('user.users')}
              to="/users"
              icon={<CIcon content={cilPeople} size="xl" className="mr-3" />}
            />
            <CSidebarNavItem
              className="font-weight-bold"
              name={t('common.system')}
              to="/system"
              icon={<CIcon content={cilSettings} size="xl" className="mr-3" />}
            />
            <SidebarDevices newData={newConnectionData} />
          </>
        }
        redirectTo="/devices"
      />
      <div className="c-wrapper">
        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          routes={routes}
          t={t}
          i18n={i18n}
          logout={logout}
          logo="assets/OpenWiFi_LogoLockup_DarkGreyColour.svg"
          authToken={currentToken}
          endpoints={endpoints}
          user={user}
          avatar={avatar}
          hideBreadcrumb
        />
        <div className="c-body">
          <ToastProvider>
            <WebSocketProvider setNewConnectionData={onConnectionDataChange}>
              <PageContainer t={t} routes={routes} redirectTo="/devices" />
            </WebSocketProvider>
          </ToastProvider>
        </div>
        <Footer t={t} version={process.env.VERSION} />
      </div>
    </div>
  );
};

export default TheLayout;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logout } from 'utils/authHelper';
import routes from 'routes';
import { useAuth } from 'contexts/AuthProvider';
import { Header } from 'ucentral-libs';
import Sidebar from './Sidebar';
import TheContent from './Content';
import TheFooter from './Footer';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');
  const { endpoints, currentToken } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        t={t}
        logo="assets/OpenWiFi_LogoLockup_DarkGreyColour.svg"
      />
      <div className="c-wrapper">
        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          routes={routes}
          t={t}
          i18n={i18n}
          logout={logout}
          authToken={currentToken}
          endpoints={endpoints}
        />
        <div className="c-body">
          <TheContent />
        </div>
        <TheFooter />
      </div>
    </div>
  );
};

export default TheLayout;

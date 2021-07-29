import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logout } from 'utils/authHelper';
import routes from 'routes';
import { useAuth } from 'contexts/AuthProvider';
import { Header, Sidebar, Footer, PageContainer } from 'ucentral-libs';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');
  const { endpoints, currentToken, user, avatar } = useAuth();
  const { t, i18n } = useTranslation();

  const navigation = [
    {
      _tag: 'CSidebarNavDropdown',
      name: t('common.devices'),
      icon: 'cilRouter',
      _children: [
        {
          _tag: 'CSidebarNavItem',
          name: t('common.dashboard'),
          to: '/devicedashboard',
        },
        {
          _tag: 'CSidebarNavItem',
          name: t('common.list'),
          to: '/devices',
        },
      ],
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('user.users'),
      to: '/users',
      icon: 'cilPeople',
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('firmware.title'),
      to: '/firmware',
      icon: 'cilSave',
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('settings.title'),
      to: '/settings',
      icon: 'cilSettings',
    },
  ];

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        logo="assets/OpenWiFi_LogoLockup_WhiteColour.svg"
        options={navigation}
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
        />
        <div className="c-body">
          <PageContainer t={t} routes={routes} redirectTo="/devices" />
        </div>
        <Footer t={t} version="2.0.0" />
      </div>
    </div>
  );
};

export default TheLayout;

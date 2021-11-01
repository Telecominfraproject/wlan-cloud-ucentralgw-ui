import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import routes from 'routes';
import { Header, Sidebar, Footer, PageContainer, ToastProvider, useAuth } from 'ucentral-libs';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');
  const { endpoints, currentToken, user, avatar, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const navigation = [
    {
      _tag: 'CSidebarNavItem',
      name: t('common.devices'),
      icon: 'cilRouter',
      to: '/devices',
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('firmware.title'),
      icon: 'cilSave',
      to: '/firmware',
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('user.users'),
      to: '/users',
      icon: 'cilPeople',
    },
    {
      _tag: 'CSidebarNavItem',
      name: t('common.system'),
      to: '/system',
      icon: 'cilSettings',
    },
  ];

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        logo="assets/Arilia_Small.png"
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
          logo="assets/Arilia_Small.png"
          authToken={currentToken}
          endpoints={endpoints}
          user={user}
          avatar={avatar}
          hideBreadcrumb
        />
        <div className="c-body">
          <ToastProvider>
            <PageContainer t={t} routes={routes} redirectTo="/devices" />
          </ToastProvider>
        </div>
        <Footer t={t} version={process.env.VERSION} />
      </div>
    </div>
  );
};

export default TheLayout;

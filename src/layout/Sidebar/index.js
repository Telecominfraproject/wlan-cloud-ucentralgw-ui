import React from 'react';
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from '@coreui/react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import logoBar from 'assets/OpenWiFi_LogoLockup_WhiteColour.svg';
import styles from './index.module.scss';

const TheSidebar = ({ showSidebar, setShowSidebar }) => {
  const { t } = useTranslation();

  const navigation = [
    {
      _tag: 'CSidebarNavItem',
      name: t('common.device_list'),
      to: '/devices',
      icon: 'cilNotes',
    },
  ];

  return (
    <CSidebar show={showSidebar} onShowChange={(val) => setShowSidebar(val)}>
      <CSidebarBrand className="d-md-down-none" to="/devices">
        <img
          className={[styles.sidebarImgFull, 'c-sidebar-brand-full'].join(' ')}
          src={logoBar}
          alt="OpenWifi"
        />
        <img
          className={[styles.sidebarImgMinimized, 'c-sidebar-brand-minimized'].join(' ')}
          src={logoBar}
          alt="OpenWifi"
        />
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={navigation}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none" />
    </CSidebar>
  );
};

TheSidebar.propTypes = {
  showSidebar: PropTypes.string.isRequired,
  setShowSidebar: PropTypes.func.isRequired,
};

export default React.memo(TheSidebar);

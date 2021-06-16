import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { useTranslation } from 'react-i18next';
import logoBar from 'assets/OpenWiFi_LogoLockup_WhiteColour.svg';



const TheSidebar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const show = useSelector((state) => state.sidebarShow);

  const navigation = [
    {
      _tag: 'CSidebarNavItem',
      name: t("common.device_list"),
      to: '/devices',
      icon: 'cilNotes',
    },
  ];

  return (
    <CSidebar show={show} onShowChange={(val) => dispatch({ type: 'set', sidebarShow: val })}>
      <CSidebarBrand className="d-md-down-none" to="/devices">
        <img
          className="c-sidebar-brand-full"
          src={logoBar}
          style={{ height: '75px' }}
          alt="OpenWifi"
        />
        <img
          className="c-sidebar-brand-minimized"
          src={logoBar}
          style={{ height: '75px', width: '75px' }}
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

export default React.memo(TheSidebar);

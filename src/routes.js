import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceDashboard = React.lazy(() => import('pages/DeviceDashboard'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));
const UserListPage = React.lazy(() => import('pages/UserListPage'));
const ProfilePage = React.lazy(() => import('pages/ProfilePage'));
const WifiAnalysisPage = React.lazy(() => import('pages/WifiAnalysisPage'));
const SettingsPage = React.lazy(() => import('pages/SettingsPage'));
const FirmwareListPage = React.lazy(() => import('pages/FirmwareListPage'));
const FirmwareDashboard = React.lazy(() => import('pages/FirmwareDashboard'));

export default [
  {
    path: '/devicedashboard',
    exact: true,
    name: 'common.device_dashboard',
    component: DeviceDashboard,
  },
  { path: '/devices', exact: true, name: 'common.devices', component: DeviceListPage },
  {
    path: '/devices/:deviceId/wifianalysis',
    name: 'wifi_analysis.title',
    component: WifiAnalysisPage,
  },
  { path: '/devices/:deviceId', name: 'common.device_page', component: DevicePage },
  { path: '/firmware', name: 'firmware.title', component: FirmwareListPage },
  {
    path: '/firmwaredashboard',
    exact: true,
    name: 'common.firmware_dashboard',
    component: FirmwareDashboard,
  },
  { path: '/users', exact: true, name: 'user.users', component: UserListPage },
  { path: '/myprofile', exact: true, name: 'user.my_profile', component: ProfilePage },
  { path: '/settings', exact: true, name: 'settings.title', component: SettingsPage },
];

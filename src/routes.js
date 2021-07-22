import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));
const UserListPage = React.lazy(() => import('pages/UserListPage'));
const ProfilePage = React.lazy(() => import('pages/ProfilePage'));
const WifiAnalysisPage = React.lazy(() => import('pages/WifiAnalysisPage'));

export default [
  { path: '/devices', exact: true, name: 'common.devices', component: DeviceListPage },
  {
    path: '/devices/:deviceId/wifianalysis',
    name: 'wifi_analysis.title',
    component: WifiAnalysisPage,
  },
  { path: '/devices/:deviceId', name: 'common.device_page', component: DevicePage },
  { path: '/users', exact: true, name: 'user.users', component: UserListPage },
  { path: '/myprofile', exact: true, name: 'user.my_profile', component: ProfilePage },
];

import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));
const UserListPage = React.lazy(() => import('pages/UserListPage'));
const ProfilePage = React.lazy(() => import('pages/ProfilePage'));
const SystemPage = React.lazy(() => import('pages/SystemPage'));
const FirmwareListPage = React.lazy(() => import('pages/FirmwareListPage'));
const DefaultConfigurationsPage = React.lazy(() => import('pages/DefaultConfigurationsPage'));

export default [
  { path: '/devices', exact: true, name: 'common.devices', component: DeviceListPage },
  { path: '/devices/:deviceId', name: 'common.device_page', component: DevicePage },
  {
    path: '/defaultconfigurations',
    name: 'Default Configurations',
    component: DefaultConfigurationsPage,
  },
  { path: '/firmware', name: 'firmware.title', component: FirmwareListPage },
  { path: '/users', exact: true, name: 'user.users', component: UserListPage },
  { path: '/myprofile', exact: true, name: 'user.my_profile', component: ProfilePage },
  { path: '/system', exact: true, name: 'common.system', component: SystemPage },
];

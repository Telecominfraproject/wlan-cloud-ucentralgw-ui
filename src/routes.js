import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));
const UserListPage = React.lazy(() => import('pages/UserListPage'));
const UserCreationPage = React.lazy(() => import('pages/UserCreationPage'));

export default [
  { path: '/devices', exact: true, name: 'common.devices', component: DeviceListPage },
  { path: '/devices/:deviceId', name: 'common.device_page', component: DevicePage },
  { path: '/users', exact: true, name: 'user.users', component: UserListPage },
  { path: '/users/create', exact: true, name: 'user.create', component: UserCreationPage },
];

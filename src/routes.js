import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));

const routes = [
  { path: '/devices', exact: true, name: 'common.devices', component: DeviceListPage },
  { path: '/devices/:deviceId', name: 'common.device_page', component: DevicePage },
];

export default routes;

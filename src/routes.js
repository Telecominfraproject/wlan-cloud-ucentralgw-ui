import React from 'react';

const DevicePage = React.lazy(() => import('pages/DevicePage'));
const DeviceListPage = React.lazy(() => import('pages/DeviceListPage'));

const routes = [
  { path: '/devices', exact: true, name: 'Devices', component: DeviceListPage },
  { path: '/devices/:deviceId', name: 'Device Page', component: DevicePage },
  { path: '/Device', name: 'Device', component: DevicePage },
  { path: '/page2', name: 'Page2', component: DeviceListPage, exact: true },
];

export default routes;

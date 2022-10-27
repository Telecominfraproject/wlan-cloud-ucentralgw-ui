import React from 'react';
import { Icon } from '@chakra-ui/react';
import { Barcode, FloppyDisk, Info, UsersThree, WifiHigh } from 'phosphor-react';
import { Route } from 'models/Routes';

const DefaultConfigurationsPage = React.lazy(() => import('pages/DefaultConfigurations'));
const DevicePage = React.lazy(() => import('pages/Device'));
const DevicesPage = React.lazy(() => import('pages/Devices'));
const FirmwarePage = React.lazy(() => import('pages/Firmware'));
const ProfilePage = React.lazy(() => import('pages/Profile'));
const SystemPage = React.lazy(() => import('pages/SystemPage'));
const UsersPage = React.lazy(() => import('pages/UsersPage'));

const routes: Route[] = [
  {
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/',
    name: 'devices.title',
    icon: (active: boolean) => (
      <Icon as={WifiHigh} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: DevicesPage,
  },
  {
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/firmware',
    name: 'analytics.firmware',
    icon: (active: boolean) => (
      <Icon as={FloppyDisk} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: FirmwarePage,
  },
  {
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/configurations',
    name: 'configurations.title',
    icon: (active: boolean) => (
      <Icon as={Barcode} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: DefaultConfigurationsPage,
  },
  {
    hidden: true,
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/devices/:id',
    name: 'devices.one',
    icon: (active: boolean) => (
      <Icon as={WifiHigh} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: DevicePage,
  },
  {
    hidden: true,
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/account',
    name: 'account.title',
    icon: (active: boolean) => (
      <Icon as={UsersThree} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: ProfilePage,
  },
  {
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/users',
    name: 'users.title',
    icon: (active: boolean) => (
      <Icon as={UsersThree} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: UsersPage,
  },
  {
    authorized: ['root', 'partner', 'admin'],
    path: '/system',
    name: 'system.title',
    icon: (active: boolean) => (
      <Icon as={Info} color="inherit" h={active ? '32px' : '24px'} w={active ? '32px' : '24px'} />
    ),
    component: SystemPage,
  },
];

export default routes;

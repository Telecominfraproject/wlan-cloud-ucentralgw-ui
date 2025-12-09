import React from 'react';
import { Barcode, FloppyDisk, Info, ListBullets, TerminalWindow, UsersThree, WifiHigh } from '@phosphor-icons/react';
import { Route } from 'models/Routes';

const AdvancedSystemPage = React.lazy(() => import('pages/AdvancedSystemPage'));
const DefaultConfigurationsPage = React.lazy(() => import('pages/DefaultConfigurations'));
const DefaultFirmwarePage = React.lazy(() => import('pages/DefaultFirmware'));
const DevicePage = React.lazy(() => import('pages/Device'));
const DashboardPage = React.lazy(() => import('pages/Devices/Dashboard'));
const AllDevicesPage = React.lazy(() => import('pages/Devices/ListCard'));
const BlacklistPage = React.lazy(() => import('pages/Devices/Blacklist'));
const ControllerLogsPage = React.lazy(() => import('pages/Notifications/GeneralLogs'));
const DeviceLogsPage = React.lazy(() => import('pages/Notifications/DeviceLogs'));
const ExportAllLogsPage = React.lazy(() => import('pages/Notifications/ExportAll'));
const FmsLogsPage = React.lazy(() => import('pages/Notifications/FmsLogs'));
const SecLogsPage = React.lazy(() => import('pages/Notifications/SecLogs'));
const FirmwarePage = React.lazy(() => import('pages/Firmware/List'));
const FirmwareDashboard = React.lazy(() => import('pages/Firmware/Dashboard'));
const ProfilePage = React.lazy(() => import('pages/Profile'));
const ScriptsPage = React.lazy(() => import('pages/Scripts'));
const UsersPage = React.lazy(() => import('pages/UsersPage'));
const MonitoringPage = React.lazy(() => import('pages/MonitoringPage'));
const EndpointsPage = React.lazy(() => import('pages/EndpointsPage'));
const SystemConfigurationPage = React.lazy(() => import('pages/SystemConfigurationPage'));

const routes: Route[] = [
  {
    id: 'devices-group',
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    name: 'devices.title',
    icon: () => <WifiHigh size={28} weight="bold" />,
    children: [
      {
        id: 'devices-table',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/',
        name: 'devices.all',
        navName: 'devices.title',
        component: AllDevicesPage,
      },
      {
        id: 'devices-dashboard',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/devices_dashboard',
        name: 'analytics.dashboard',
        component: DashboardPage,
      },
      {
        id: 'devices-blacklist',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/devices_blacklist',
        name: 'controller.devices.blacklist',
        component: BlacklistPage,
      },
    ],
  },
  {
    id: 'firmware-group',
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    name: 'analytics.firmware',
    icon: () => <FloppyDisk size={28} weight="bold" />,
    children: [
      {
        id: 'firmware-table',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/firmware',
        name: 'devices.all',
        navName: 'analytics.firmware',
        component: FirmwarePage,
      },
      {
        id: 'firmware-dashboard',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/firmware/dashboard',
        name: 'analytics.dashboard',
        component: FirmwareDashboard,
      },
    ],
  },
  {
    id: 'scripts',
    authorized: ['root'],
    path: '/scripts/:id',
    name: 'script.other',
    icon: () => <TerminalWindow size={28} weight="bold" />,
    component: ScriptsPage,
  },
  {
    id: 'defaults-group',
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    name: 'common.defaults',
    icon: () => <Barcode size={28} weight="bold" />,
    children: [
      {
        id: 'configurations',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/configurations',
        name: 'configurations.title',
        component: DefaultConfigurationsPage,
      },
      {
        id: 'default_firmware',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/firmware/defaults',
        name: 'firmware.one',
        component: DefaultFirmwarePage,
      },
    ],
  },
  {
    id: 'logs-group',
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    name: 'controller.devices.logs',
    icon: () => <ListBullets size={28} weight="bold" />,
    children: [
      {
        id: 'logs-devices',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/logs/devices',
        name: 'devices.title',
        navName: (t) => `${t('devices.one')} ${t('controller.devices.logs')}`,
        component: DeviceLogsPage,
      },
      {
        id: 'logs-controller',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/logs/controller',
        name: 'simulation.controller',
        navName: (t) => `${t('simulation.controller')} ${t('controller.devices.logs')}`,
        component: ControllerLogsPage,
      },
      {
        id: 'logs-security',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/logs/security',
        name: 'logs.security',
        navName: (t) => `${t('logs.security')} ${t('controller.devices.logs')}`,
        component: SecLogsPage,
      },
      {
        id: 'logs-firmware',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/logs/firmware',
        name: 'logs.firmware',
        navName: (t) => `${t('logs.firmware')} ${t('controller.devices.logs')}`,
        component: FmsLogsPage,
      },
      {
        id: 'logs-export',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/logs/export',
        name: 'logs.export_all',
        component: ExportAllLogsPage,
      },
    ],
  },
  {
    id: 'device-page',
    hidden: true,
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/devices/:id',
    name: 'devices.one',
    navName: 'PATH',
    icon: () => <WifiHigh size={28} weight="bold" />,
    component: DevicePage,
  },
  {
    id: 'account-page',
    hidden: true,
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/account',
    name: 'account.title',
    icon: () => <UsersThree size={28} weight="bold" />,
    component: ProfilePage,
  },
  {
    id: 'users-page',
    authorized: ['root', 'partner', 'admin', 'csr', 'system'],
    path: '/users',
    name: 'users.title',
    icon: () => <UsersThree size={28} weight="bold" />,
    component: UsersPage,
  },
  {
    id: 'system-group',
    authorized: ['root', 'partner', 'admin'],
    name: 'system.title',
    icon: () => <Info size={28} weight="bold" />,
    children: [
      {
        id: 'system-advanced',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/systemAdvanced',
        name: 'system.advanced',
        component: AdvancedSystemPage,
      },
      {
        id: 'system-configuration',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/systemConfiguration',
        name: 'system.configuration',
        component: SystemConfigurationPage,
      },
      {
        id: 'system-monitoring',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/systemMonitoring',
        name: 'analytics.monitoring',
        component: MonitoringPage,
      },
      {
        id: 'system-services',
        authorized: ['root', 'partner', 'admin', 'csr', 'system'],
        path: '/services',
        name: 'system.services',
        component: EndpointsPage,
      },
    ],
  },
];

export default routes;

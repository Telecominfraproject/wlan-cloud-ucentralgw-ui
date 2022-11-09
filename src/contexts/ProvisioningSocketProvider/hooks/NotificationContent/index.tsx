import React from 'react';
import ConfigurationPushesNotificationContent from './ConfigurationPushes';
import DeviceRebootNotificationContent from './DeviceReboot';
import DeviceUpgradeNotificationContent from './DeviceUpgrade';
import { ProvisioningVenueNotificationMessage } from 'contexts/ProvisioningSocketProvider/utils';

interface Props {
  notification?: ProvisioningVenueNotificationMessage['notification'];
}

const NotificationContent = ({ notification }: Props) => {
  if (!notification) return null;

  if (notification.type_id === 2000 || notification.type === 'venue_config_update') {
    return <ConfigurationPushesNotificationContent notification={notification} />;
  }

  if (notification.type_id === 3000 || notification.type === 'venue_rebooter') {
    return <DeviceRebootNotificationContent notification={notification} />;
  }

  if (notification.type_id === 1000 || notification.type === 'venue_fw_upgrade') {
    return <DeviceUpgradeNotificationContent notification={notification} />;
  }
  return null;
};

export default NotificationContent;

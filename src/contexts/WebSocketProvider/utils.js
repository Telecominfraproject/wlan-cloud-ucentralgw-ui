export const acceptedNotificationTypes = [
  'venue_configuration_update',
  'entity_configuration_update',
];
export const deviceNotificationTypes = [
  'device_connection',
  'device_disconnection',
  'device_firmware_upgrade',
  'device_statistics',
];

export const extractWebSocketResponse = (message) => {
  try {
    const data = JSON.parse(message.data);
    if (data.notification && acceptedNotificationTypes.includes(data.notification.type)) {
      const { notification } = data;
      return { notification, type: 'NOTIFICATION' };
    }
    if (data.notification && deviceNotificationTypes.includes(data.notification.type)) {
      return {
        serialNumber: data.notification.content.serialNumber,
        type: 'DEVICE_NOTIFICATION',
        subType: data.notification.type,
      };
    }
    if (data.command_response_id) {
      return { data, type: 'COMMAND' };
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export const getStatusFromNotification = (notification) => {
  let status = 'success';
  if (notification.content.warning?.length > 0) status = 'warning';
  if (notification.content.error?.length > 0) status = 'error';

  return status;
};

export const getNotificationDescription = (t, notification) => {
  if (
    notification.content.type === 'venue_configuration_update' ||
    notification.content.type === 'entity_configuration_update'
  ) {
    return t('configurations.notification_details', {
      success: notification.content.success.length,
      warning: notification.content.warning.length,
      error: notification.content.error.length,
    });
  }
  return notification.content.details;
};

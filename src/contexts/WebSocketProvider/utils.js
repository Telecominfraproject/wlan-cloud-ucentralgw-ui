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
    if (data.notification.type === 'device_connections_statistics') {
      return { content: data.notification.content, type: 'device_connections_statistics' };
    }
  } catch {
    return undefined;
  }
  return undefined;
};

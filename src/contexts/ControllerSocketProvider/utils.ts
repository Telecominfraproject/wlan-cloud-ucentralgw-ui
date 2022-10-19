type ConnectionMessage = {
  notification: {
    notificationId: number;
    type: 'device_disconnection' | 'device_connection' | 'device_statistics';
    content: {
      serialNumber: string;
    };
  };
};

type ConnectionStatisticsMessage = {
  notification: {
    notificationId: number;
    type: 'device_connections_statistics';
    content: {
      numberOfDevices: number;
      numberOfConnectingDevices: number;
      averageConnectedTime: number;
    };
  };
};

export type SerialSearchMessage = {
  serialNumbers: string[];
  notification: undefined;
};

export type WebSocketInitialMessage = ConnectionMessage | ConnectionStatisticsMessage;

export type WebSocketNotification =
  | {
      type: 'DEVICE_CONNECTION' | 'DEVICE_DISCONNECTION' | 'DEVICE_STATISTICS';
      serialNumber: string;
    }
  | {
      type: 'DEVICE_CONNECTIONS_STATISTICS';
      statistics: {
        numberOfDevices: number;
        numberOfConnectingDevices: number;
        averageConnectedTime: number;
      };
      serialNumber: undefined;
    }
  | {
      type: 'DEVICE_SEARCH_RESULTS';
      serialNumbers: string[];
      serialNumber: undefined;
    };
export type SocketEventCallback = {
  id: string;
  type: 'DEVICE_CONNECTION' | 'DEVICE_DISCONNECTION';
  serialNumber: string;
  callback: () => void;
};

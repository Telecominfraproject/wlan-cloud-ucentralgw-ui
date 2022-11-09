import { InitialSocketMessage } from 'models/Socket';

export type ControllerSocketNotificationTypeId = 1 | 1000 | 2000 | 3000 | 4000 | 5000 | 6000;
export const ControllerSocketNotificationTypeMap = {
  1: 'logs',
  1000: 'device_connections_statistics',
  2000: 'device_configuration_upgrade',
  3000: 'device_firmware_upgrade',
  4000: 'device_connection',
  5000: 'device_disconnection',
  6000: 'device_statistics',
};

type ConnectionMessage = {
  notification: {
    notificationId: number;
    type?: 'device_disconnection' | 'device_connection' | 'device_statistics';
    type_id?: 4000 | 5000 | 6000;
    content: {
      serialNumber: string;
    };
  };
  serialNumbers?: undefined;
  notificationTypes?: undefined;
};

type LogMessage = {
  notification: {
    notificationId: number;
    type?: undefined;
    type_id: 1;
    content: {
      level: LogLevel;
      msg: string;
      source: string;
      thread_id: number;
      thread_name: string;
      timestamp: number;
    };
  };
  serialNumbers?: undefined;
  notificationTypes?: undefined;
};

type ConnectionStatisticsMessage = {
  notification: {
    notificationId: number;
    type?: 'device_connections_statistics';
    type_id?: 1000;
    content: {
      serialNumber?: undefined;
      numberOfDevices: number;
      numberOfConnectingDevices: number;
      averageConnectedTime: number;
    };
  };
  serialNumbers?: undefined;
  notificationTypes?: undefined;
};

export type SerialSearchMessage = {
  serialNumbers: string[];
  notification?: undefined;
};

export type ControllerSocketRawMessage =
  | Partial<ConnectionMessage>
  | Partial<ConnectionStatisticsMessage>
  | Partial<LogMessage>
  | InitialSocketMessage
  | SerialSearchMessage;

export type LogLevel = 'information' | 'critical' | 'debug' | 'error' | 'fatal' | 'notice' | 'trace' | 'warning';

export type SocketWebSocketNotificationData =
  | {
      type: 'DEVICE_CONNECTION' | 'DEVICE_DISCONNECTION' | 'DEVICE_STATISTICS';
      serialNumber: string;
      log?: undefined;
      notificationTypes?: undefined;
    }
  | {
      type: 'DEVICE_CONNECTIONS_STATISTICS';
      statistics: {
        numberOfDevices: number;
        numberOfConnectingDevices: number;
        averageConnectedTime: number;
      };
      serialNumber?: undefined;
      log?: undefined;
      notificationTypes?: undefined;
    }
  | {
      type: 'DEVICE_SEARCH_RESULTS';
      serialNumbers: string[];
      serialNumber?: undefined;
      log?: undefined;
      notificationTypes?: undefined;
    }
  | {
      type: 'LOG';
      serialNumber?: undefined;
      serialNumbers?: undefined;
      notificationTypes?: undefined;
      log: LogMessage['notification']['content'];
    }
  | {
      type: 'INITIAL_MESSAGE';
      serialNumber?: undefined;
      serialNumbers?: undefined;
      notificationTypes?: undefined;
      log?: undefined;
      message: InitialSocketMessage;
    };
export type SocketEventCallback = {
  id: string;
  type: 'DEVICE_CONNECTION' | 'DEVICE_DISCONNECTION';
  serialNumber: string;
  callback: () => void;
};

import { InitialSocketMessage } from 'models/Socket';

export type FirmwareSocketNotificationTypeId = 1 | 1000 | 2000 | 3000 | 4000 | 5000 | 6000;
export const FirmwareSocketNotificationTypeMap = {
  1: 'logs',
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

export type FirmwareSocketRawMessage = Partial<LogMessage> | InitialSocketMessage;

export type LogLevel = 'information' | 'critical' | 'debug' | 'error' | 'fatal' | 'notice' | 'trace' | 'warning';

export type SocketWebSocketNotificationData =
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
  type: 'LOG';
  serialNumber: string;
  callback: () => void;
};

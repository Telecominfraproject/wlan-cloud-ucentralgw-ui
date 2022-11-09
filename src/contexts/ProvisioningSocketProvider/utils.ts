import { InitialSocketMessage } from 'models/Socket';
import { Subscriber } from 'models/Subscriber';

export type ProvisioningSocketNotificationTypeId = 1 | 1000 | 2000 | 3000 | 4000 | 5000 | 6000;
export const ProvisioningSocketNotificationTypeMap = {
  1: 'logs',
  1000: 'venue_fw_upgrade',
  2000: 'venue_config_update',
  3000: 'venue_rebooter',
};

export const ACCEPTED_VENUE_NOTIFICATION_TYPES = [1000, 2000, 3000];

export type ProvisioningCommandResponse = {
  command_response_id: number;
  response: { serialNumbers?: string[]; users?: Subscriber[]; results?: string[] };
  notification?: undefined;
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
  command_response_id?: undefined;
  response?: undefined;
  notificationTypes?: undefined;
};

export type ProvisioningVenueNotificationMessage = {
  notification: {
    notification_id: number;
    type?: 'venue_fw_upgrade' | 'venue_config_update' | 'venue_rebooter';
    type_id: 1000 | 2000 | 3000;
    content: {
      title: string;
      details: string;
      success: string[];
      noFirmware?: string[];
      notConnected?: string[];
      skipped?: string[];
      warning: string[];
      error: string[];
      timeStamp: number;
    };
  };
  command_response_id?: undefined;
  response?: undefined;
  notificationTypes?: undefined;
};

export type ProvisioningSocketRawMessage =
  | Partial<LogMessage>
  | Partial<ProvisioningVenueNotificationMessage>
  | Partial<ProvisioningCommandResponse>
  | InitialSocketMessage;

export type LogLevel = 'information' | 'critical' | 'debug' | 'error' | 'fatal' | 'notice' | 'trace' | 'warning';

export type SocketWebSocketNotificationData =
  | {
      type: 'NOTIFICATION';
      data: ProvisioningVenueNotificationMessage['notification'];
      log?: undefined;
      notificationTypes?: undefined;
    }
  | {
      type: 'LOG';
      notificationTypes?: undefined;
      log: LogMessage['notification']['content'];
    }
  | {
      type: 'COMMAND';
      data: ProvisioningCommandResponse;
      notificationTypes?: undefined;
      log?: undefined;
    }
  | {
      type: 'INITIAL_MESSAGE';
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

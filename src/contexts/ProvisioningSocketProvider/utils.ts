import { Subscriber } from 'models/Subscriber';

// Notifications we react to from the WS
export const acceptedNotificationTypes = [
  'venue_configuration_update',
  'entity_configuration_update',
  'venue_rebooter',
  'venue_upgrader',
];

// Data received from WS on Venue update notification
export type ProviderWebSocketVenueUpdateResponse = {
  notification_id: number;
  type: 'venue_configuration_update' | 'entity_configuration_update' | 'venue_rebooter' | 'venue_upgrader';
  content: {
    type: 'venue_configuration_update' | 'entity_configuration_update' | 'venue_rebooter' | 'venue_upgrader';
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

export type ProviderCommandResponse = {
  command_response_id: number;
  response: { serialNumbers?: string[]; users?: Subscriber[]; results?: string[] };
};

// Parsed WebSocket message
export type ProviderWebSocketParsedMessage =
  | {
      type: 'NOTIFICATION';
      data: ProviderWebSocketVenueUpdateResponse;
    }
  | {
      type: 'COMMAND';
      data: ProviderCommandResponse;
    };

// Parsing raw WS messages into a more usable format
export const extractProviderWebSocketResponse = (message: MessageEvent): ProviderWebSocketParsedMessage | undefined => {
  try {
    const data = JSON.parse(message.data);
    if (data.notification && acceptedNotificationTypes.includes(data.notification.type)) {
      const notification = data.notification as ProviderWebSocketVenueUpdateResponse;
      return { data: notification, type: 'NOTIFICATION' };
    }
    if (data.command_response_id) {
      return { data, type: 'COMMAND' } as {
        type: 'COMMAND';
        data: ProviderCommandResponse;
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
};

// What we store in the store
export type ProviderWebSocketMessage =
  | {
      type: 'NOTIFICATION';
      data: ProviderWebSocketParsedMessage;
      timestamp: Date;
    }
  | {
      type: 'COMMAND';
      data: ProviderCommandResponse;
      timestamp: Date;
    };

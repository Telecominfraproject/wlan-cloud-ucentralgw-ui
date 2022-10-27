export interface WebSocketNotification {
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
}

export interface WebSocketResponse {
  notification?: WebSocketNotification;
}

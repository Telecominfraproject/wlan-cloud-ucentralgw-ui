export type NotificationType = {
  helper?: string;
  id: number;
};

export type InitialSocketMessage = {
  notification: undefined;
  serialNumbers: undefined;
  command_response_id: undefined;
  response: undefined;
  success?: string;
  error?: string;
  notificationTypes?: NotificationType[];
};

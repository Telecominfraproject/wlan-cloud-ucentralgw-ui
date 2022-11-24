import { QueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import create from 'zustand';
import { ControllerSocketRawMessage, SocketEventCallback, SocketWebSocketNotificationData } from './utils';
import { axiosGw } from 'constants/axiosInstances';
import { DevicesStats, DeviceWithStatus } from 'hooks/Network/Devices';
import { NotificationType } from 'models/Socket';

export type ControllerWebSocketMessage =
  | {
      type: 'NOTIFICATION';
      data: SocketWebSocketNotificationData;
      timestamp: Date;
      id: string;
    }
  | {
      type: 'UNKNOWN';
      data: {
        type?: string;
        type_id?: number;
        [key: string]: unknown;
      };
      timestamp: Date;
      id: string;
    };

const parseRawWebSocketMessage = (
  message?: ControllerSocketRawMessage,
): SocketWebSocketNotificationData | undefined => {
  if (message && message.notification) {
    if (message.notification.type_id === 4000 || message.notification.type === 'device_connection') {
      return {
        type: 'DEVICE_CONNECTION',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type_id === 5000 || message.notification.type === 'device_disconnection') {
      return {
        type: 'DEVICE_DISCONNECTION',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type_id === 6000 || message.notification.type === 'device_statistics') {
      return {
        type: 'DEVICE_STATISTICS',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type_id === 1000 || message.notification.type === 'device_connections_statistics') {
      return {
        type: 'DEVICE_CONNECTIONS_STATISTICS',
        statistics: message.notification.content,
      };
    }
    if (message.notification.type_id === 1) {
      return {
        type: 'LOG',
        log: message.notification.content,
      };
    }
  } else if (message?.serialNumbers) {
    return {
      type: 'DEVICE_SEARCH_RESULTS',
      serialNumbers: message.serialNumbers,
    };
  } else if (message?.notificationTypes) {
    return {
      type: 'INITIAL_MESSAGE',
      message,
    };
  }
  return undefined;
};

// Invalidate and update queries related to device connection status
const handleConnectionNotification = (serialNumber: string, isConnected: boolean, queryClient: QueryClient) => {
  queryClient.invalidateQueries(['device', serialNumber]);
  queryClient.invalidateQueries(['device', 'status', serialNumber]);

  const queries = queryClient.getQueriesData(['devices', 'all']);

  for (const query of queries) {
    if (query[1] && query) {
      const { devicesWithStatus } = query[1] as { devicesWithStatus: DeviceWithStatus[] };
      for (let i = 0; i < devicesWithStatus?.length ?? 0; i += 1) {
        const device = devicesWithStatus[i];
        if (device && device.serialNumber === serialNumber) {
          device.connected = isConnected;
          devicesWithStatus[i] = device;
          queryClient.setQueryData(query[0], { ...{ devicesWithStatus: [...devicesWithStatus] } });
          break;
        }
      }
    }
  }
};

// Invalidate latest device stats
const handleDeviceStatsNotification = (serialNumber: string, queryClient: QueryClient) => {
  queryClient.invalidateQueries(['deviceStatistics', serialNumber, 'newest']);
};

// Set new global connection stats
const handleGlobalConnectionStats = (stats: DevicesStats, queryClient: QueryClient) => {
  queryClient.setQueryData(['devices', 'all', 'connection-statistics'], stats);
};

export type ControllerStoreState = {
  availableLogTypes: NotificationType[];
  hiddenLogIds: number[];
  setHiddenLogIds: (logsToHide: number[]) => void;
  lastMessage?: ControllerWebSocketMessage;
  allMessages: ControllerWebSocketMessage[];
  addMessage: (rawMsg: ControllerSocketRawMessage, queryClient: QueryClient) => void;
  eventListeners: SocketEventCallback[];
  addEventListeners: (callback: SocketEventCallback[]) => void;
  webSocket?: WebSocket;
  send: (str: string) => void;
  startWebSocket: (token: string, tries?: number) => void;
  isWebSocketOpen: boolean;
  setWebSocketOpen: (isOpen: boolean) => void;
  lastSearchResults: string[];
  setLastSearchResults: (result: string[]) => void;
  errors: { str: string; timestamp: Date }[];
};

export const useControllerStore = create<ControllerStoreState>((set, get) => ({
  availableLogTypes: [],
  hiddenLogIds: [],
  setHiddenLogIds: (logsToHide: number[]) => {
    get().send(JSON.stringify({ 'drop-notifications': logsToHide }));
    set(() => ({
      hiddenLogIds: logsToHide,
    }));
  },
  allMessages: [] as ControllerWebSocketMessage[],
  addMessage: (rawMsg: ControllerSocketRawMessage, queryClient: QueryClient) => {
    try {
      const msg = parseRawWebSocketMessage(rawMsg);
      if (msg) {
        // Handle notification-specific logic
        if (msg.type === 'DEVICE_CONNECTION' || msg.type === 'DEVICE_DISCONNECTION') {
          handleConnectionNotification(msg.serialNumber, true, queryClient);
        } else if (msg.type === 'DEVICE_STATISTICS') {
          handleDeviceStatsNotification(msg.serialNumber, queryClient);
        } else if (msg.type === 'DEVICE_CONNECTIONS_STATISTICS') {
          handleGlobalConnectionStats(
            {
              connectedDevices: msg.statistics.numberOfDevices,
              connectingDevices: msg.statistics.numberOfConnectingDevices,
              averageConnectionTime: msg.statistics.averageConnectedTime,
            },
            queryClient,
          );
        } else if (msg.type === 'DEVICE_SEARCH_RESULTS') {
          set({ lastSearchResults: msg.serialNumbers });
        } else if (msg.type === 'INITIAL_MESSAGE') {
          if (msg.message.notificationTypes) {
            set({ availableLogTypes: msg.message.notificationTypes });
          }
        }
        // General handling
        const obj: ControllerWebSocketMessage = {
          type: 'NOTIFICATION',
          data: msg,
          timestamp: msg.log?.timestamp ? new Date(msg.log.timestamp * 1000) : new Date(),
          id: uuid(),
        };

        const eventsToFire = get().eventListeners.filter(
          ({ type, serialNumber }) => type === msg.type && serialNumber === msg.serialNumber,
        );

        if (eventsToFire.length > 0) {
          for (const event of eventsToFire) {
            event.callback();
          }

          return set((state) => ({
            allMessages:
              state.allMessages.length <= 1000 ? [...state.allMessages, obj] : [...state.allMessages.slice(1), obj],
            lastMessage: obj,
            eventListeners: get().eventListeners.filter(
              ({ id }) => !eventsToFire.find(({ id: findId }) => findId === id),
            ),
          }));
        }

        return set((state) => ({
          allMessages:
            state.allMessages.length <= 1000 ? [...state.allMessages, obj] : [...state.allMessages.slice(1), obj],
          lastMessage: obj,
        }));
      }
      return undefined;
    } catch {
      // TODO - Add error message to socket logs
      return set((state) => ({
        errors: [...state.errors, { str: JSON.stringify(rawMsg), timestamp: new Date() }],
      }));
    }
  },
  eventListeners: [] as SocketEventCallback[],
  addEventListeners: (events: SocketEventCallback[]) =>
    set((state) => ({ eventListeners: [...state.eventListeners, ...events] })),
  isWebSocketOpen: false,
  setWebSocketOpen: (isOpen: boolean) => set({ isWebSocketOpen: isOpen }),
  send: (str: string) => {
    const ws = get().webSocket;
    if (ws) ws.send(str);
  },
  startWebSocket: (token: string, tries = 0) => {
    const newTries = tries + 1;
    if (tries <= 10) {
      set({
        webSocket: new WebSocket(
          `${
            axiosGw?.defaults?.baseURL ? axiosGw.defaults.baseURL.replace('https', 'wss').replace('http', 'ws') : ''
          }/ws`,
        ),
      });
      const ws = get().webSocket;
      if (ws) {
        ws.onopen = () => {
          set({ isWebSocketOpen: true });
          ws.send(`token:${token}`);
        };
        ws.onclose = () => {
          set({ isWebSocketOpen: false, lastSearchResults: [] });
          setTimeout(() => get().startWebSocket(token, newTries), 3000);
        };
      }
    }
  },
  lastSearchResults: [] as string[],
  setLastSearchResults: (results: string[]) => set({ lastSearchResults: results }),
  errors: [],
}));

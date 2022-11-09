import { QueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import create from 'zustand';
import { FirmwareSocketRawMessage, SocketEventCallback, SocketWebSocketNotificationData } from './utils';
import { axiosFms } from 'constants/axiosInstances';
import { NotificationType } from 'models/Socket';

export type FirmwareWebSocketMessage =
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

const parseRawWebSocketMessage = (message?: FirmwareSocketRawMessage): SocketWebSocketNotificationData | undefined => {
  if (message && message.notification) {
    if (message.notification.type_id === 1) {
      return {
        type: 'LOG',
        log: message.notification.content,
      };
    }
  } else if (message?.notificationTypes) {
    return {
      type: 'INITIAL_MESSAGE',
      message,
    };
  }
  return undefined;
};

export type FirmwareStoreState = {
  availableLogTypes: NotificationType[];
  hiddenLogIds: number[];
  setHiddenLogIds: (logsToHide: number[]) => void;
  lastMessage?: FirmwareWebSocketMessage;
  allMessages: FirmwareWebSocketMessage[];
  addMessage: (rawMsg: FirmwareSocketRawMessage, queryClient: QueryClient) => void;
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

export const useFirmwareStore = create<FirmwareStoreState>((set, get) => ({
  availableLogTypes: [],
  hiddenLogIds: [],
  setHiddenLogIds: (logsToHide: number[]) => {
    get().send(JSON.stringify({ 'drop-notifications': logsToHide }));
    set(() => ({
      hiddenLogIds: logsToHide,
    }));
  },
  allMessages: [] as FirmwareWebSocketMessage[],
  addMessage: (rawMsg: FirmwareSocketRawMessage) => {
    try {
      const msg = parseRawWebSocketMessage(rawMsg);
      if (msg) {
        // Handle notification-specific logic
        if (msg.type === 'INITIAL_MESSAGE') {
          if (msg.message.notificationTypes) {
            set({ availableLogTypes: msg.message.notificationTypes });
          }
        }
        // General handling
        const obj: FirmwareWebSocketMessage = {
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
            axiosFms?.defaults?.baseURL ? axiosFms.defaults.baseURL.replace('https', 'wss').replace('http', 'ws') : ''
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
          set({ isWebSocketOpen: false });
          setTimeout(() => get().startWebSocket(token, newTries), 3000);
        };
      }
    }
  },
  lastSearchResults: [] as string[],
  setLastSearchResults: (results: string[]) => set({ lastSearchResults: results }),
  errors: [],
}));

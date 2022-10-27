import create from 'zustand';
import { SocketEventCallback, WebSocketNotification } from './utils';
import { axiosGw } from 'constants/axiosInstances';

export type WebSocketMessage =
  | {
      type: 'NOTIFICATION';
      data: WebSocketNotification;
      timestamp: Date;
    }
  | { type: 'UNKNOWN'; data: Record<string, unknown>; timestamp: Date };

export type ControllerStoreState = {
  lastMessage?: WebSocketMessage;
  allMessages: WebSocketMessage[];
  addMessage: (message: WebSocketNotification) => void;
  eventListeners: SocketEventCallback[];
  addEventListeners: (callback: SocketEventCallback[]) => void;
  webSocket?: WebSocket;
  send: (str: string) => void;
  startWebSocket: (token: string, tries?: number) => void;
  isWebSocketOpen: boolean;
  setWebSocketOpen: (isOpen: boolean) => void;
  lastSearchResults: string[];
  setLastSearchResults: (result: string[]) => void;
};

export const useControllerStore = create<ControllerStoreState>((set, get) => ({
  allMessages: [] as WebSocketMessage[],
  addMessage: (msg: WebSocketNotification) => {
    const obj: WebSocketMessage = {
      type: 'NOTIFICATION',
      data: msg,
      timestamp: new Date(),
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
        eventListeners: get().eventListeners.filter(({ id }) => !eventsToFire.find(({ id: findId }) => findId === id)),
      }));
    }

    return set((state) => ({
      allMessages:
        state.allMessages.length <= 1000 ? [...state.allMessages, obj] : [...state.allMessages.slice(1), obj],
      lastMessage: obj,
    }));
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
          `${axiosGw?.defaults?.baseURL ? axiosGw.defaults.baseURL.replace('https', 'wss') : ''}/ws`,
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
}));

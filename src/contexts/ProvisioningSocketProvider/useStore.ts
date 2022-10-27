import create from 'zustand';
import { ProviderWebSocketMessage, ProviderWebSocketParsedMessage } from './utils';
import { axiosProv } from 'constants/axiosInstances';

export type ProviderStoreState = {
  lastMessage?: ProviderWebSocketMessage;
  allMessages: ProviderWebSocketMessage[];
  addMessage: (message: ProviderWebSocketParsedMessage) => void;
  webSocket?: WebSocket;
  send: (str: string) => void;
  startWebSocket: (token: string, tries?: number) => void;
  isWebSocketOpen: boolean;
  setWebSocketOpen: (isOpen: boolean) => void;
};

export const useProviderStore = create<ProviderStoreState>((set, get) => ({
  allMessages: [] as ProviderWebSocketMessage[],
  addMessage: (msg: ProviderWebSocketParsedMessage) => {
    // @ts-ignore
    const obj: ProviderWebSocketMessage =
      msg.type === 'COMMAND'
        ? {
            type: msg.type,
            data: msg.data,
            timestamp: new Date(),
          }
        : {
            type: msg.type,
            data: msg.data,
            timestamp: new Date(),
          };

    return set((state) => ({
      allMessages:
        state.allMessages.length <= 1000 ? [...state.allMessages, obj] : [...state.allMessages.slice(1), obj],
      lastMessage: obj,
    }));
  },
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
            axiosProv?.defaults?.baseURL ? axiosProv.defaults.baseURL.replace('https', 'wss').replace('http', 'ws') : ''
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
}));

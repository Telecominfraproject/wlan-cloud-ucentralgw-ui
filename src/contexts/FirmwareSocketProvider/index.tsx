import React, { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFirmwareStore } from './useStore';
import { FirmwareSocketRawMessage } from './utils';
import { axiosFms, axiosSec } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';

export type FirmwareSocketContextReturn = Record<string, unknown>;

const FirmwareSocketContext = React.createContext<FirmwareSocketContextReturn>({
  webSocket: undefined,
  isOpen: false,
});

export const FirmwareSocketProvider = ({ children }: { children: React.ReactElement }) => {
  const { token, isUserLoaded } = useAuth();
  const { addMessage, isOpen, webSocket, onStartWebSocket } = useFirmwareStore((state) => ({
    addMessage: state.addMessage,
    isOpen: state.isWebSocketOpen,
    webSocket: state.webSocket,
    onStartWebSocket: state.startWebSocket,
  }));

  const queryClient = useQueryClient();

  const onMessage = useCallback((message: MessageEvent<string>) => {
    try {
      const data = JSON.parse(message.data) as FirmwareSocketRawMessage | undefined;
      if (data) {
        addMessage(data, queryClient);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  // useEffect for created the WebSocket and 'storing' it in useRef
  useEffect(() => {
    if (isUserLoaded && axiosFms?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
      onStartWebSocket(token ?? '');
    }

    const wsCurrent = webSocket;
    return () => wsCurrent?.close();
  }, [isUserLoaded]);

  // useEffect for generating global notifications
  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', onMessage);
    }

    return () => {
      if (webSocket) webSocket.removeEventListener('message', onMessage);
    };
  }, [webSocket]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      let timeoutId;

      if (webSocket) {
        if (document.visibilityState === 'hidden') {
          /* timeoutId = setTimeout(() => {
            if (webSocket) webSocket.onclose = () => {};
            webSocket?.close();
            setIsOpen(false);
          }, 5000); */
        } else {
          // If tab is active again, verify if browser killed the WS
          clearTimeout(timeoutId);

          if (!isOpen && isUserLoaded && axiosFms?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
            onStartWebSocket(token ?? '');
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [webSocket, isOpen]);

  const values: FirmwareSocketContextReturn = useMemo(() => ({}), []);

  return <FirmwareSocketContext.Provider value={values}>{children}</FirmwareSocketContext.Provider>;
};

export const useGlobalFirmwareSocket: () => FirmwareSocketContextReturn = () => React.useContext(FirmwareSocketContext);

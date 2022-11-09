import React, { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSecurityStore } from './useStore';
import { SecuritySocketRawMessage } from './utils';
import { useAuth } from 'contexts/AuthProvider';

export type SecuritySocketContextReturn = Record<string, unknown>;

const SecuritySocketContext = React.createContext<SecuritySocketContextReturn>({
  webSocket: undefined,
  isOpen: false,
});

export const SecuritySocketProvider = ({ children }: { children: React.ReactElement }) => {
  const { token, isUserLoaded } = useAuth();
  const { addMessage, isOpen, webSocket, onStartWebSocket } = useSecurityStore((state) => ({
    addMessage: state.addMessage,
    isOpen: state.isWebSocketOpen,
    webSocket: state.webSocket,
    onStartWebSocket: state.startWebSocket,
  }));

  const queryClient = useQueryClient();

  const onMessage = useCallback((message: MessageEvent<string>) => {
    try {
      const data = JSON.parse(message.data) as SecuritySocketRawMessage | undefined;
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
    if (isUserLoaded) {
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

          if (!isOpen && isUserLoaded) {
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

  const values: SecuritySocketContextReturn = useMemo(() => ({}), []);

  return <SecuritySocketContext.Provider value={values}>{children}</SecuritySocketContext.Provider>;
};

export const useGlobalSecuritySocket: () => SecuritySocketContextReturn = () => React.useContext(SecuritySocketContext);

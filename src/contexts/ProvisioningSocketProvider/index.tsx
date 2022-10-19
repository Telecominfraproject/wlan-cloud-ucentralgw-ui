import React, { useCallback, useEffect, useMemo } from 'react';
import useWebSocketNotification from './hooks/NotificationContent/useWebSocketNotification';
import { useProviderStore } from './useStore';
import { extractProviderWebSocketResponse } from './utils';
import { axiosProv, axiosSec } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';

export type ProviderSocketContextReturn = Record<string, unknown>;

const ProviderSocketContext = React.createContext<ProviderSocketContextReturn>({
  webSocket: undefined,
  isOpen: false,
});

export const ProvisioningSocketProvider = ({ children }: { children: React.ReactElement }) => {
  const { token, isUserLoaded } = useAuth();
  const { pushNotification, modal } = useWebSocketNotification();
  const { addMessage, isOpen, setIsOpen, webSocket, onStartWebSocket } = useProviderStore((state) => ({
    addMessage: state.addMessage,
    setIsOpen: state.setWebSocketOpen,
    isOpen: state.isWebSocketOpen,
    webSocket: state.webSocket,
    onStartWebSocket: state.startWebSocket,
  }));

  const onMessage = useCallback((msg: MessageEvent<string>) => {
    try {
      const extracted = extractProviderWebSocketResponse(msg);
      if (extracted) {
        addMessage(extracted);
        if (extracted.type === 'NOTIFICATION') {
          pushNotification(extracted.data);
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  // useEffect for created the WebSocket and 'storing' it in useRef
  useEffect(() => {
    if (isUserLoaded && axiosProv?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
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
          timeoutId = setTimeout(() => {
            if (webSocket) webSocket.onclose = () => {};
            webSocket?.close();
            setIsOpen(false);
          }, 5000);
        } else {
          clearTimeout(timeoutId);

          if (!isOpen && isUserLoaded && axiosProv?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
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

  const values: ProviderSocketContextReturn = useMemo(() => ({}), []);

  return (
    <ProviderSocketContext.Provider value={values}>
      <>
        {children}
        {modal}
      </>
    </ProviderSocketContext.Provider>
  );
};

export const useGlobalProvisioningSocket: () => ProviderSocketContextReturn = () =>
  React.useContext(ProviderSocketContext);

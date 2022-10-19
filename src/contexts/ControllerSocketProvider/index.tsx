import React, { useCallback, useEffect, useMemo } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { useControllerStore } from './useStore';
import { SerialSearchMessage, WebSocketInitialMessage, WebSocketNotification } from './utils';
import { axiosGw, axiosSec } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';
import { DevicesStats, DeviceWithStatus } from 'hooks/Network/Devices';

const extractWebSocketNotification = (
  message?: WebSocketInitialMessage | SerialSearchMessage,
): WebSocketNotification | undefined => {
  if (message && message.notification) {
    if (message.notification.type === 'device_connection') {
      return {
        type: 'DEVICE_CONNECTION',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type === 'device_disconnection') {
      return {
        type: 'DEVICE_DISCONNECTION',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type === 'device_statistics') {
      return {
        type: 'DEVICE_STATISTICS',
        serialNumber: message.notification.content.serialNumber,
      };
    }
    if (message.notification.type === 'device_connections_statistics') {
      return {
        type: 'DEVICE_CONNECTIONS_STATISTICS',
        statistics: message.notification.content,
        serialNumber: undefined,
      };
    }
  } else if (message?.serialNumbers) {
    return {
      type: 'DEVICE_SEARCH_RESULTS',
      serialNumbers: message.serialNumbers,
      serialNumber: undefined,
    };
  }
  return undefined;
};

// Invalidate and update queries related to device connection status
const connectedNotification = (serialNumber: string, isConnected: boolean, queryClient: QueryClient) => {
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

export type ControllerSocketContextReturn = Record<string, unknown>;

const ControllerSocketContext = React.createContext<ControllerSocketContextReturn>({
  webSocket: undefined,
  isOpen: false,
});

export const ControllerSocketProvider = ({ children }: { children: React.ReactElement }) => {
  const { token, isUserLoaded } = useAuth();
  const { addMessage, isOpen, setIsOpen, setLastSearchResults, webSocket, onStartWebSocket } = useControllerStore(
    (state) => ({
      addMessage: state.addMessage,
      setIsOpen: state.setWebSocketOpen,
      isOpen: state.isWebSocketOpen,
      lastSearchResults: state.lastSearchResults,
      setLastSearchResults: state.setLastSearchResults,
      webSocket: state.webSocket,
      onStartWebSocket: state.startWebSocket,
    }),
  );

  const queryClient = useQueryClient();

  const onMessage = useCallback((message: MessageEvent<string>) => {
    try {
      const data = JSON.parse(message.data) as WebSocketInitialMessage | undefined;
      const extracted = extractWebSocketNotification(data);
      if (extracted) {
        addMessage(extracted);
        if (extracted.type === 'DEVICE_CONNECTION') {
          queryClient.invalidateQueries(['device', extracted.serialNumber]);
          connectedNotification(extracted.serialNumber, true, queryClient);
        } else if (extracted.type === 'DEVICE_DISCONNECTION') {
          queryClient.invalidateQueries(['device', extracted.serialNumber]);
          connectedNotification(extracted.serialNumber, false, queryClient);
        } else if (extracted.type === 'DEVICE_STATISTICS') {
          queryClient.invalidateQueries(['deviceStatistics', extracted.serialNumber, 'latestHour']);
        } else if (extracted.type === 'DEVICE_CONNECTIONS_STATISTICS') {
          queryClient.setQueryData(['devices', 'all', 'connection-statistics'], {
            connectedDevices: extracted.statistics.numberOfDevices,
            connectingDevices: extracted.statistics.numberOfConnectingDevices,
            averageConnectionTime: extracted.statistics.averageConnectedTime,
          } as DevicesStats);
        } else if (extracted.type === 'DEVICE_SEARCH_RESULTS') {
          setLastSearchResults(extracted.serialNumbers);
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  // useEffect for created the WebSocket and 'storing' it in useRef
  useEffect(() => {
    if (isUserLoaded && axiosGw?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
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

          if (!isOpen && isUserLoaded && axiosGw?.defaults?.baseURL !== axiosSec?.defaults?.baseURL) {
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

  const values: ControllerSocketContextReturn = useMemo(() => ({}), []);

  return <ControllerSocketContext.Provider value={values}>{children}</ControllerSocketContext.Provider>;
};

export const useGlobalControllerSocket: () => ControllerSocketContextReturn = () =>
  React.useContext(ControllerSocketContext);

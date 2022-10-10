import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from 'ucentral-libs';
import PropTypes from 'prop-types';
import useWebSocketNotification from './hooks/NotificationContent/useWebSocketNotification';
import useSocketReducer from './useSocketReducer';
import { extractWebSocketResponse } from './utils';

const WebSocketContext = React.createContext({
  webSocket: undefined,
  isOpen: false,
  addDeviceListener: () => {},
});

export const WebSocketProvider = ({ children, setNewConnectionData }) => {
  const { currentToken, endpoints } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ws = useRef(undefined);
  const { lastMessage, dispatch } = useSocketReducer();
  const { pushNotification } = useWebSocketNotification();

  const onMessage = useCallback((message) => {
    const result = extractWebSocketResponse(message);
    if (result?.type === 'device_connections_statistics') {
      setNewConnectionData(result.content);
    }
    if (result?.type === 'NOTIFICATION') {
      dispatch({ type: 'NEW_NOTIFICATION', notification: result.notification });
      pushNotification(result.notification);
    }
    if (result?.type === 'DEVICE_NOTIFICATION') {
      dispatch({
        type: 'NEW_DEVICE_NOTIFICATION',
        serialNumber: result.serialNumber,
        subType: result.subType,
      });
    }
    if (result?.type === 'COMMAND') {
      dispatch({ type: 'NEW_COMMAND', data: result.data });
    }
  }, []);

  const onStartWebSocket = (tries = 0) => {
    const newTries = tries + 1;
    if (tries <= 10) {
      ws.current = new WebSocket(
        `${endpoints.owgw?.replace('https', 'wss').replace('http', 'ws')}/api/v1/ws`,
      );
      ws.current.onopen = () => {
        setIsOpen(true);
        ws.current?.send(`token:${currentToken}`);
      };
      ws.current.onclose = () => {
        setIsOpen(false);
        setTimeout(() => onStartWebSocket(newTries), 3000);
      };
      ws.current.onerror = () => {
        setIsOpen(false);
        setTimeout(() => onStartWebSocket(newTries), 3000);
      };
    }
  };

  // useEffect for created the WebSocket and 'storing' it in useRef
  useEffect(() => {
    if (endpoints?.owgw !== undefined) {
      onStartWebSocket();
    }
    const wsCurrent = ws?.current;
    return () => wsCurrent?.close();
  }, [endpoints]);

  // useEffect for generating global notifications
  useEffect(() => {
    if (ws?.current) {
      ws.current.addEventListener('message', onMessage);
    }

    const wsCurrent = ws?.current;
    return () => {
      if (wsCurrent) wsCurrent.removeEventListener('message', onMessage);
    };
  }, [ws?.current]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      let timeoutId;

      if (ws?.current) {
        if (document.visibilityState === 'hidden') {
          timeoutId = setTimeout(() => {
            ws.current.onclose = () => {};
            ws.current?.close();
            setIsOpen(false);
          }, 5000);
        } else {
          clearTimeout(timeoutId);

          if (!isOpen && endpoints?.owgw !== undefined) {
            onStartWebSocket();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ws?.current, isOpen]);

  const values = useMemo(
    () => ({
      lastMessage,
      webSocket: ws.current,
      addDeviceListener: ({ serialNumber, types, addToast, onTrigger }) =>
        dispatch({ type: 'ADD_DEVICE_LISTENER', serialNumber, types, addToast, onTrigger }),
      removeDeviceListener: ({ serialNumber }) =>
        dispatch({ type: 'REMOVE_DEVICE_LISTENER', serialNumber }),
      isOpen,
    }),
    [ws, isOpen, lastMessage],
  );

  return <WebSocketContext.Provider value={values}>{children}</WebSocketContext.Provider>;
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
  setNewConnectionData: PropTypes.func.isRequired,
};

export const useGlobalWebSocket = () => React.useContext(WebSocketContext);

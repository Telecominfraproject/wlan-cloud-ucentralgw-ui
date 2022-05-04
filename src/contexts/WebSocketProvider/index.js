import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from 'ucentral-libs';
import PropTypes from 'prop-types';
import useWebSocketNotification from './hooks/NotificationContent/useWebSocketNotification';
import useSocketReducer from './useSocketReducer';
import { extractWebSocketResponse } from './utils';

const WebSocketContext = React.createContext({
  webSocket: undefined,
  isOpen: false,
  allMessages: [],
  addDeviceListener: () => {},
});

export const WebSocketProvider = ({ children }) => {
  const { currentToken, endpoints } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ws = useRef(undefined);
  const { allMessages, lastMessage, dispatch } = useSocketReducer();
  const { pushNotification } = useWebSocketNotification();

  const onMessage = useCallback((message) => {
    const result = extractWebSocketResponse(message);
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

  // useEffect for created the WebSocket and 'storing' it in useRef
  useEffect(() => {
    ws.current = new WebSocket(`${endpoints.owgw.replace('https', 'wss')}/api/v1/ws`);
    ws.current.onopen = () => {
      setIsOpen(true);
      ws.current?.send(`token:${currentToken}`);
    };
    ws.current.onclose = () => {
      setIsOpen(false);
    };
    ws.current.onerror = () => {
      setIsOpen(false);
    };

    const wsCurrent = ws?.current;
    return () => wsCurrent?.close();
  }, []);

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
  const values = useMemo(
    () => ({
      allMessages,
      lastMessage,
      webSocket: ws.current,
      addDeviceListener: ({ serialNumber, types, addToast, onTrigger }) =>
        dispatch({ type: 'ADD_DEVICE_LISTENER', serialNumber, types, addToast, onTrigger }),
      removeDeviceListener: ({ serialNumber }) =>
        dispatch({ type: 'REMOVE_DEVICE_LISTENER', serialNumber }),
      isOpen,
    }),
    [ws, isOpen, allMessages, lastMessage],
  );

  return <WebSocketContext.Provider value={values}>{children}</WebSocketContext.Provider>;
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGlobalWebSocket = () => React.useContext(WebSocketContext);

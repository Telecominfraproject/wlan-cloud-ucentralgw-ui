import { useCallback, useMemo } from 'react';
import { useToast } from 'ucentral-libs';

const useWebSocketNotification = () => {
  const { addToast } = useToast();

  const pushNotification = useCallback((notification) => {
    addToast({
      title: notification.content.title,
      body: notification.content.details,
      color: 'info',
      autohide: true,
    });
  }, []);

  const toReturn = useMemo(
    () => ({
      pushNotification,
    }),
    [],
  );

  return toReturn;
};

export default useWebSocketNotification;

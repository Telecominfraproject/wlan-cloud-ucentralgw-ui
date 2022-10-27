import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProviderStore } from 'contexts/ProvisioningSocketProvider/useStore';
import { ProviderCommandResponse } from 'contexts/ProvisioningSocketProvider/utils';
import { randomIntId } from 'helpers/stringHelper';

const useProviderWebSocketCommand = ({ callback }: { callback: (command: ProviderCommandResponse) => void }) => {
  const { isOpen, webSocket, lastMessage } = useProviderStore((state) => ({
    isOpen: state.isWebSocketOpen,
    webSocket: state.webSocket,
    lastMessage: state.lastMessage,
  }));

  const [waitingCommands, setWaitingCommands] = useState<number[]>([]);

  const send = useCallback(
    (data: Record<string, unknown>) => {
      if (isOpen && webSocket) {
        const id = randomIntId();
        setWaitingCommands([...waitingCommands, id]);
        const toSend = { ...data, id };
        webSocket.send(JSON.stringify(toSend));
      }
    },
    [isOpen, webSocket, waitingCommands],
  );

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'COMMAND') {
      if (waitingCommands.includes(lastMessage.data?.command_response_id)) callback(lastMessage.data);
    }
  }, [lastMessage, waitingCommands]);

  const toReturn = useMemo(
    () => ({
      isOpen,
      send,
    }),
    [send],
  );

  return toReturn;
};

export default useProviderWebSocketCommand;

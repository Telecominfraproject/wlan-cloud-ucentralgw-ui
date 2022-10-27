import { useCallback, useEffect, useMemo, useState } from 'react';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import debounce from 'helpers/debounce';
import { randomIntId } from 'helpers/stringHelper';

export type UseControllerDeviceSearchProps = {
  minLength?: number;
};

export const useControllerDeviceSearch = ({ minLength = 4 }: UseControllerDeviceSearchProps) => {
  const [tempValue, setTempValue] = useState('');
  const [waitingSearch, setWaitingSearch] = useState<
    { command: string; serial_prefix: string; operatorId?: string } | undefined
  >(undefined);
  const [results, setResults] = useState<string[]>([]);
  const { isOpen, send, lastSearchResults } = useControllerStore((state) => ({
    isOpen: state.isWebSocketOpen,
    send: state.send,
    lastSearchResults: state.lastSearchResults,
  }));

  const sendMessage = useCallback(
    (data: Record<string, unknown>) => {
      if (isOpen) {
        const id = randomIntId();
        const toSend = { ...data, id };
        send(JSON.stringify(toSend));
      }
    },
    [isOpen],
  );
  const onChange = useCallback(
    (v: string) => {
      if (v.length >= minLength) setWaitingSearch({ command: 'serial_number_search', serial_prefix: v });
    },
    [setWaitingSearch],
  );

  const debounceChange = useCallback(
    debounce((v) => {
      onChange(v as string);
    }, 300),
    [setWaitingSearch],
  );

  const onInputChange = useCallback(
    (v: string) => {
      if (v !== tempValue) {
        setTempValue(v);
        debounceChange(v);
      }
    },
    [tempValue, debounceChange, setTempValue, setWaitingSearch],
  );

  const resetSearch = () => {
    setResults([]);
    setTempValue('');
  };

  useEffect(() => {
    if (lastSearchResults) setResults(lastSearchResults);
  }, [lastSearchResults]);

  useEffect(() => {
    if (waitingSearch) {
      sendMessage(waitingSearch);
    }
  }, [waitingSearch, isOpen]);

  const toReturn = useMemo(
    () => ({ inputValue: tempValue, results, onInputChange, isOpen, resetSearch }),
    [tempValue, results, onInputChange, isOpen],
  );

  return toReturn;
};

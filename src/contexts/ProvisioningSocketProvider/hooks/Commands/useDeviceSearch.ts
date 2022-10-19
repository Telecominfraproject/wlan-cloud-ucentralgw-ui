import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'helpers/debounce';
import useWebSocketCommand from './useWebSocketCommand';
import { ProviderCommandResponse } from 'contexts/ProvisioningSocketProvider/utils';

export type UseDeviceSearchProps = {
  minLength?: number;
  operatorId?: string;
};

export const useProviderDeviceSearch = ({ minLength = 4, operatorId }: UseDeviceSearchProps) => {
  const [tempValue, setTempValue] = useState('');
  const [waitingSearch, setWaitingSearch] = useState<
    { command: string; serial_prefix: string; operatorId?: string } | undefined
  >(undefined);
  const [results, setResults] = useState<string[]>([]);
  const onNewResult = (newResult: ProviderCommandResponse) => {
    if (newResult.response.serialNumbers) setResults(newResult.response.serialNumbers as string[]);
  };
  const { isOpen, send } = useWebSocketCommand({ callback: onNewResult });

  const onChange = useCallback(
    (v: string) => {
      if (v.length >= minLength) setWaitingSearch({ command: 'serial_number_search', serial_prefix: v, operatorId });
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
    if (waitingSearch) {
      send(waitingSearch);
    }
  }, [waitingSearch, isOpen]);

  const toReturn = useMemo(
    () => ({ inputValue: tempValue, results, onInputChange, isOpen, resetSearch }),
    [tempValue, results, onInputChange, isOpen],
  );

  return toReturn;
};

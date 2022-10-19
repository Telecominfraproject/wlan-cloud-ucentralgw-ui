import { useCallback, useEffect, useMemo, useState } from 'react';
import useWebSocketCommand from './useWebSocketCommand';
import { ProviderCommandResponse } from 'contexts/ProvisioningSocketProvider/utils';
import debounce from 'helpers/debounce';

export type UseLocationSearchProps = {
  minLength?: number;
};

export const useLocationSearch = ({ minLength = 8 }: UseLocationSearchProps) => {
  const [tempValue, setTempValue] = useState('');
  const [waitingSearch, setWaitingSearch] = useState<{ command: string; address: string } | undefined>(undefined);
  const [results, setResults] = useState<string[]>([]);
  const onNewResult = (newResult: ProviderCommandResponse) => {
    if (newResult.response.results) setResults(newResult.response.results as string[]);
  };
  const { isOpen, send } = useWebSocketCommand({ callback: onNewResult });

  const onChange = useCallback(
    (v: string) => {
      if (v.length >= minLength) setWaitingSearch({ command: 'address_completion', address: v });
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

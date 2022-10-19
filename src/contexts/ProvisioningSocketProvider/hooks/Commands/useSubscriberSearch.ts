import { useCallback, useEffect, useMemo, useState } from 'react';
import useWebSocketCommand from './useWebSocketCommand';
import { ProviderCommandResponse } from 'contexts/ProvisioningSocketProvider/utils';
import debounce from 'helpers/debounce';
import { Subscriber } from 'models/Subscriber';

export type UseSubscriberSearchProps = {
  minLength?: number;
  operatorId: string;
  mode: 'nameSearch' | 'emailSearch';
};
export const useSubscriberSearch = ({ minLength = 4, operatorId, mode }: UseSubscriberSearchProps) => {
  const [tempValue, setTempValue] = useState('');
  const [waitingSearch, setWaitingSearch] = useState<
    { command: string; emailSearch?: string; nameSearch?: string; operatorId?: string } | undefined
  >(undefined);
  const [results, setResults] = useState<Subscriber[]>([]);
  const onNewResult = (newResult: ProviderCommandResponse) => {
    if (newResult.response.users) setResults(newResult.response.users as Subscriber[]);
  };
  const { isOpen, send } = useWebSocketCommand({ callback: onNewResult });

  const onChange = useCallback(
    (v: string) => {
      if (v.length >= minLength)
        setWaitingSearch({
          command: 'subuser_search',
          emailSearch: mode === 'emailSearch' ? v : undefined,
          nameSearch: mode === 'nameSearch' ? v : undefined,
          operatorId,
        });
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

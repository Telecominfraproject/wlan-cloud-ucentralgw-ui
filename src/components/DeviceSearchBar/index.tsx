import * as React from 'react';
import { Heading } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthProvider';
import { useControllerDeviceSearch } from 'contexts/ControllerSocketProvider/hooks/Commands/useDeviceSearch';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';

const DeviceSearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { startWebSocket, isWebSocketOpen } = useControllerStore((state) => ({
    startWebSocket: state.startWebSocket,
    isWebSocketOpen: state.isWebSocketOpen,
  }));
  const { inputValue, results, onInputChange } = useControllerDeviceSearch({
    minLength: 2,
  });

  const NoOptionsMessage = React.useCallback(
    () => (
      <Heading size="sm" textAlign="center">
        {isWebSocketOpen ? t('common.no_devices_found') : `${t('controller.devices.connecting')}...`}
      </Heading>
    ),
    [t, isWebSocketOpen],
  );
  const onClick = React.useCallback((v: { value: string }) => {
    navigate(`/devices/${v.value}`);
  }, []);
  const onChange = React.useCallback((v: string) => {
    if ((v.length === 0 || v.match('^[a-fA-F0-9-*]+$')) && v.length <= 13) onInputChange(v);
  }, []);

  const onFocus = () => {
    if (!isWebSocketOpen && token && token.length > 0) {
      startWebSocket(token, 0);
    }
  };
  return (
    <Select
      chakraStyles={{
        control: (provided) => ({
          ...provided,
          borderRadius: '15px',
          color: 'unset',
        }),
        input: (provided) => ({
          ...provided,
          width: '140px',
        }),
        dropdownIndicator: (provided) => ({
          ...provided,
          backgroundColor: 'unset',
          border: 'unset',
        }),
        menu: (provided) => ({
          ...provided,
          color: 'black',
        }),
      }}
      components={{ NoOptionsMessage }}
      // @ts-ignore
      options={results.map((v: string) => ({ label: v, value: v }))}
      filterOption={() => true}
      inputValue={inputValue}
      value={inputValue}
      placeholder={t('common.search')}
      onInputChange={onChange}
      onFocus={onFocus}
      // @ts-ignore
      onChange={onClick}
    />
  );
};

export default DeviceSearchBar;

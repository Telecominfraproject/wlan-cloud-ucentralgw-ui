import * as React from 'react';
import { Heading } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useControllerDeviceSearch } from 'contexts/ControllerSocketProvider/hooks/Commands/useDeviceSearch';

const DeviceSearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { inputValue, results, onInputChange, isOpen } = useControllerDeviceSearch({
    minLength: 2,
  });

  const NoOptionsMessage = React.useCallback(
    () => (
      <Heading size="sm" textAlign="center">
        {t('common.no_devices_found')}
      </Heading>
    ),
    [t],
  );
  const onClick = React.useCallback((v: { value: string }) => {
    navigate(`/devices/${v.value}`);
  }, []);
  const onChange = React.useCallback((v: string) => {
    if (v.length === 0 || v.match('^[a-fA-F0-9-*]+$')) onInputChange(v);
  }, []);

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
      // @ts-ignore
      onChange={onClick}
      isDisabled={!isOpen}
    />
  );
};

export default DeviceSearchBar;

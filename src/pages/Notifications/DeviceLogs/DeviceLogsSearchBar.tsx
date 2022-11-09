import * as React from 'react';
import { Heading } from '@chakra-ui/react';
import { InputActionMeta, Select } from 'chakra-react-select';
import { useTranslation } from 'react-i18next';
import { useControllerDeviceSearch } from 'contexts/ControllerSocketProvider/hooks/Commands/useDeviceSearch';

type Props = {
  onSearchSelect: (value: string) => void;
};

const DeviceLogsSearchBar = ({ onSearchSelect }: Props) => {
  const { t } = useTranslation();
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
    onSearchSelect(v.value);
    onInputChange(v.value);
  }, []);

  const onChange = React.useCallback((v: string, action: InputActionMeta) => {
    if (action.action !== 'input-blur' && action.action !== 'menu-close') {
      if (v.length === 0 || v.match('^[a-fA-F0-9-*]+$')) onInputChange(v);
    }
  }, []);
  const onFocus = React.useCallback(() => {
    onSearchSelect('');
    onInputChange('');
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
          opacity: 1,
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
      hideSelectedOptions={false}
      isClearable
      blurInputOnSelect
      onFocus={onFocus}
      // @ts-ignore
      options={results.map((v: string) => ({ label: v, value: v }))}
      filterOption={() => true}
      inputValue={inputValue}
      value={inputValue}
      placeholder={t('logs.filter')}
      onInputChange={onChange}
      // @ts-ignore
      onChange={onClick}
      isDisabled={!isOpen}
    />
  );
};

export default React.memo(DeviceLogsSearchBar);

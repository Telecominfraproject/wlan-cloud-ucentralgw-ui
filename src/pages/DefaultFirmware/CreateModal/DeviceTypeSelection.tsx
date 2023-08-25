import * as React from 'react';
import { Heading } from '@chakra-ui/react';
import { GroupBase, MultiValue, OptionBase, Select } from 'chakra-react-select';
import { useTranslation } from 'react-i18next';
import { useGetDefaultFirmware } from 'hooks/Network/DefaultFirmware';
import { useGetDeviceTypes } from 'hooks/Network/Firmware';

interface Option extends OptionBase {
  label: string;
  value: string;
}

type Props = {
  goNext: (deviceTypes: string[]) => void;
  setNextCallback: React.Dispatch<React.SetStateAction<(() => (Promise<void> | void) | undefined) | undefined>>;
};

const DeviceTypeSelection = ({ goNext, setNextCallback }: Props) => {
  const { t } = useTranslation();
  const getFirmware = useGetDefaultFirmware();
  const getDeviceTypes = useGetDeviceTypes();
  const [selectedDeviceTypes, setSelectedDeviceTypes] = React.useState<string[]>([]);
  const availableDevicesTypes = React.useMemo(() => {
    const alreadyCreatedDeviceTypes = getFirmware.data?.firmwares.map((firmware) => firmware.deviceType);
    const deviceTypes = getDeviceTypes.data?.deviceTypes;
    return deviceTypes?.filter((deviceType) => !alreadyCreatedDeviceTypes?.includes(deviceType));
  }, [getDeviceTypes.data, getFirmware.data]);

  const handleChange = (newValue: MultiValue<Option>) => {
    const deviceTypes = newValue.map(({ value }) => value);
    const allIndex = deviceTypes.indexOf('*');
    if (allIndex === 0) {
      setSelectedDeviceTypes(availableDevicesTypes ?? []);
    } else if (allIndex > 0) {
      setSelectedDeviceTypes(availableDevicesTypes ?? []);
    } else {
      setSelectedDeviceTypes(deviceTypes);
    }
  };

  const options = React.useMemo(() => {
    if (availableDevicesTypes?.length === selectedDeviceTypes.length)
      return availableDevicesTypes?.map((deviceType) => ({ value: deviceType, label: deviceType })) ?? [];

    return [
      { value: '*', label: t('common.all') },
      ...(availableDevicesTypes?.map((deviceType) => ({ value: deviceType, label: deviceType })) ?? []),
    ];
  }, [availableDevicesTypes, selectedDeviceTypes.length]);

  const onNext = () => {
    goNext(selectedDeviceTypes.sort((a, b) => a.localeCompare(b)));
  };

  React.useEffect(() => {
    if (selectedDeviceTypes.length === 0) {
      setNextCallback(undefined);
    } else {
      setNextCallback(() => onNext);
    }
  }, [selectedDeviceTypes, onNext]);

  return (
    <>
      <Heading mb={4} size="sm">
        {t('firmware.select_default_device_types')}
      </Heading>
      <Select<Option, true, GroupBase<Option>>
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            borderRadius: '15px',
            border: '2px solid',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            backgroundColor: 'unset',
            border: 'unset',
          }),
        }}
        isMulti
        closeMenuOnSelect={false}
        options={options}
        value={
          selectedDeviceTypes.map((value) => ({
            value,
            label: value,
          })) as MultiValue<Option>
        }
        isClearable={selectedDeviceTypes.length > 1}
        onChange={handleChange}
        isDisabled={!availableDevicesTypes}
      />
    </>
  );
};

export default DeviceTypeSelection;

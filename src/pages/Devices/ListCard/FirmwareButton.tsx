import * as React from 'react';
import { Button, Tooltip } from '@chakra-ui/react';
import { CheckCircle, Question, WarningCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { getRevision } from 'helpers/stringHelper';
import { DeviceWithStatus } from 'hooks/Network/Devices';
import { FirmwareAgeResponse } from 'hooks/Network/Firmware';

type Props = {
  device: DeviceWithStatus;
  age?: FirmwareAgeResponse;
  onOpenUpgrade: (serialNumber: string) => void;
};

const DeviceListFirmwareButton = ({ device, age, onOpenUpgrade }: Props) => {
  const { t } = useTranslation();

  const onClick = () => onOpenUpgrade(device.serialNumber);

  const computedAge = React.useMemo(() => {
    if (age?.latest !== undefined) {
      return {
        state: age.latest
          ? t('controller.firmware.latest')
          : t('controller.firmware.outdated', {
              count: age.age ? Math.ceil(age.age / 24 / 60 / 60) : t('common.unknown'),
            }),
        color: age.latest ? 'green.200' : 'yellow.200',
        hover: age.latest ? 'green.300' : 'yellow.300',
        icon: age.latest ? CheckCircle : WarningCircle,
      };
    }
    return {
      state: t('controller.firmware.old_firmware'),
      color: 'gray.200',
      hover: 'gray.300',
      icon: Question,
    };
  }, [age]);

  return (
    <Tooltip label={computedAge.state}>
      <Button
        size="sm"
        bgColor={computedAge.color}
        textColor="black"
        _hover={{ backgroundColor: computedAge.hover }}
        leftIcon={<computedAge.icon />}
        w="100%"
        justifyContent="start"
        onClick={onClick}
      >
        {getRevision(device.firmware)}
      </Button>
    </Tooltip>
  );
};

export default DeviceListFirmwareButton;

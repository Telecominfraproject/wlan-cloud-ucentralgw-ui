import React from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { MagnifyingGlass, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import DeviceActionDropdown from 'components/Buttons/DeviceActionDropdown';
import { DeviceWithStatus, useDeleteDevice } from 'hooks/Network/Devices';
import { GatewayDevice } from 'models/Device';

interface Props {
  device: DeviceWithStatus;
  refreshTable: () => void;
  onOpenScan: (serialNumber: string) => void;
  onOpenFactoryReset: (serialNumber: string) => void;
  onOpenUpgradeModal: (serialNumber: string) => void;
  onOpenTrace: (serialNumber: string) => void;
  onOpenEventQueue: (serialNumber: string) => void;
  onOpenConfigureModal: (serialNumber: string) => void;
  onOpenTelemetryModal: (serialNumber: string) => void;
  onOpenScriptModal: (device: GatewayDevice) => void;
  onOpenRebootModal: (serialNumber: string) => void;
}

const Actions: React.FC<Props> = ({
  device,
  refreshTable,
  onOpenScan,
  onOpenFactoryReset,
  onOpenUpgradeModal,
  onOpenTrace,
  onOpenEventQueue,
  onOpenConfigureModal,
  onOpenTelemetryModal,
  onOpenScriptModal,
  onOpenRebootModal,
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutateAsync: deleteDevice, isLoading: isDeleting } = useDeleteDevice({
    serialNumber: device.serialNumber,
  });

  const handleDeleteClick = () =>
    deleteDevice(device.serialNumber, {
      onSuccess: () => {
        refreshTable();
      },
    });

  return (
    <HStack spacing={2}>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label="Open Device Delete" colorScheme="red" icon={<Trash size={20} />} size="sm" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('crud.delete')} {device.serialNumber}
          </PopoverHeader>
          <PopoverBody>{t('crud.delete_confirm', { obj: t('devices.one') })}</PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={isDeleting}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <DeviceActionDropdown
        // @ts-ignore
        device={device}
        refresh={refreshTable}
        onOpenScan={onOpenScan}
        onOpenFactoryReset={onOpenFactoryReset}
        onOpenUpgradeModal={onOpenUpgradeModal}
        onOpenTrace={onOpenTrace}
        onOpenEventQueue={onOpenEventQueue}
        onOpenConfigureModal={onOpenConfigureModal}
        onOpenTelemetryModal={onOpenTelemetryModal}
        onOpenScriptModal={onOpenScriptModal}
        onOpenRebootModal={onOpenRebootModal}
      />
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <Link href={`#/devices/${device.serialNumber}`}>
          <IconButton
            aria-label={t('common.view_details')}
            colorScheme="blue"
            icon={<MagnifyingGlass size={20} />}
            size="sm"
          />
        </Link>
      </Tooltip>
    </HStack>
  );
};

export default React.memo(Actions);

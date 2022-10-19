import React from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
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
import { useNavigate } from 'react-router-dom';
import DeviceActionDropdown from 'components/Buttons/DeviceActionDropdown';
import { DeviceWithStatus, useDeleteDevice } from 'hooks/Network/Devices';

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
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutateAsync: deleteDevice, isLoading: isDeleting } = useDeleteDevice({
    serialNumber: device.serialNumber,
  });

  const handleViewDetailsClick = () => navigate(`/devices/${device.serialNumber}`);
  const handleDeleteClick = () =>
    deleteDevice(device.serialNumber, {
      onSuccess: () => {
        refreshTable();
      },
    });

  return (
    <Flex>
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
      />
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleViewDetailsClick}
        />
      </Tooltip>
    </Flex>
  );
};

export default Actions;

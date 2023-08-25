import * as React from 'react';
import {
  useDisclosure,
  Box,
  Button,
  Center,
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
  useToast,
} from '@chakra-ui/react';
import { Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useDeleteBatchDefaultFirmware, useGetDefaultFirmware } from 'hooks/Network/DefaultFirmware';

const DeleteDefaultFirmwaresButton = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const popoverProps = useDisclosure();
  const getFirmware = useGetDefaultFirmware();
  const deleteFirmware = useDeleteBatchDefaultFirmware();

  const handleDelete = () => {
    deleteFirmware.mutate(getFirmware.data?.firmwares.map((firmware) => firmware.deviceType) ?? [], {
      onSuccess: () => {
        toast({
          id: `firmware-delete-success`,
          title: t('common.success'),
          description: t('firmware.default_mass_delete_success', { count: getFirmware.data?.firmwares.length }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        popoverProps.onClose();
      },
    });
  };

  return (
    <Popover isOpen={popoverProps.isOpen} onOpen={popoverProps.onOpen} onClose={popoverProps.onClose}>
      <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={popoverProps.isOpen}>
        <Box>
          <PopoverTrigger>
            <IconButton aria-label={t('crud.delete')} colorScheme="red" icon={<Trash size={20} />} />
          </PopoverTrigger>
        </Box>
      </Tooltip>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          {t('crud.delete')} <b>{getFirmware.data?.firmwares.length} Settings</b>
        </PopoverHeader>
        <PopoverBody>
          Are you sure you want to delete these {getFirmware.data?.firmwares.length} default firmware settings?
        </PopoverBody>
        <PopoverFooter>
          <Center>
            <Button colorScheme="gray" mr="1" onClick={popoverProps.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="red" ml="1" onClick={handleDelete} isLoading={deleteFirmware.isLoading}>
              {t('common.yes')}
            </Button>
          </Center>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default DeleteDefaultFirmwaresButton;

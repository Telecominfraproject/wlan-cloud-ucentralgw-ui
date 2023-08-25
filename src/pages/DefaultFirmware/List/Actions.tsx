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
  useToast,
} from '@chakra-ui/react';
import { MagnifyingGlass, Trash } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DefaultFirmware, useDeleteDefaultFirmware } from 'hooks/Network/DefaultFirmware';
import { AxiosError } from 'models/Axios';

type Props = {
  firmware: DefaultFirmware;
  handleViewDetails: (firmware: DefaultFirmware) => void;
};

const Actions = ({ firmware, handleViewDetails }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteFirmware = useDeleteDefaultFirmware();

  const handleDeleteClick = () =>
    deleteFirmware.mutate(firmware.deviceType, {
      onSuccess: () => {
        toast({
          id: `firmware-delete-success`,
          title: t('common.success'),
          description: t('firmware.delete_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        onClose();
        queryClient.invalidateQueries(['defaultFirmwares']);
      },
      onError: (error) => {
        const e = error as AxiosError;
        toast({
          id: `firmware-delete-error`,
          title: t('common.error'),
          description: e?.response?.data?.ErrorDescription,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  const handleDetailsClick = () => handleViewDetails(firmware);

  return (
    <Flex>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label={t('crud.delete')} colorScheme="red" icon={<Trash size={20} />} size="sm" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('crud.delete')} <b>{firmware.deviceType}</b>
          </PopoverHeader>
          <PopoverBody>{t('crud.delete_confirm', { obj: 'setting' })}</PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteFirmware.isLoading}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleDetailsClick}
        />
      </Tooltip>
    </Flex>
  );
};

export default Actions;

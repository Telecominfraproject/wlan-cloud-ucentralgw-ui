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
import { MagnifyingGlass, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { DefaultConfigurationResponse, useDeleteDefaultConfig } from 'hooks/Network/DefaultConfigurations';
import { AxiosError } from 'models/Axios';

type Props = {
  config: DefaultConfigurationResponse;
  handleViewDetails: (config: DefaultConfigurationResponse) => void;
};

const Actions = ({ config, handleViewDetails }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteConfig = useDeleteDefaultConfig();

  const handleDeleteClick = () =>
    deleteConfig.mutate(config.name, {
      onSuccess: () => {
        toast({
          id: `config-delete-success`,
          title: t('common.success'),
          description: t('controller.configurations.delete_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (error) => {
        const e = error as AxiosError;
        toast({
          id: `config-delete-error`,
          title: t('common.error'),
          description: e?.response?.data?.ErrorDescription,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  const handleDetailsClick = () => handleViewDetails(config);

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
            {t('crud.delete')} <b>{config.name}</b>
          </PopoverHeader>
          <PopoverBody>{t('crud.delete_confirm', { obj: t('configurations.one') })}</PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteConfig.isLoading}>
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

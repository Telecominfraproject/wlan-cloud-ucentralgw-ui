import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Tag,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { Database } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Modal } from 'components/Modals/Modal';
import { useGetFirmwareDbUpdate, useUpdateFirmwareDb } from 'hooks/Network/Firmware';

const UpdateDbButton = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateDb = useUpdateFirmwareDb();
  const getLastUpdate = useGetFirmwareDbUpdate();

  const onUpdateClick = async () => {
    updateDb.mutate(undefined, {
      onSuccess: () => {
        toast({
          id: `firmware-db-update-success`,
          title: t('common.success'),
          description: t('firmware.started_db_update'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e) => {
        if (axios.isAxiosError(e)) {
          toast({
            id: `firmware-db-update-error`,
            title: t('common.error'),
            description: e?.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      },
    });
  };

  return (
    <>
      <Button colorScheme="teal" leftIcon={<Database size={20} />} onClick={onOpen}>
        {t('firmware.last_db_update_title')}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('firmware.last_db_update_modal')}
        tags={
          <Tag colorScheme="blue" size="lg">
            <TagLabel display="flex">
              <Text mr={1}>Last Update:</Text>
              <FormattedDate date={getLastUpdate.data?.lastUpdateTime} />
            </TagLabel>
          </Tag>
        }
      >
        <Box>
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>{t('common.warning')}</AlertTitle>
              <AlertDescription>{t('firmware.db_update_warning')}</AlertDescription>
            </Box>
          </Alert>
          <Center my={4}>
            <Button
              colorScheme="red"
              leftIcon={<Database size={20} />}
              onClick={onUpdateClick}
              isLoading={updateDb.isLoading}
            >
              {t('firmware.start_db_update')}
            </Button>
          </Center>
        </Box>
      </Modal>
    </>
  );
};

export default UpdateDbButton;

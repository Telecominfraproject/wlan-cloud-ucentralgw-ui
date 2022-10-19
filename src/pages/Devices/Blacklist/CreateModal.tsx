import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCreateBlacklist } from 'hooks/Network/Blacklist';
import { CreateButton } from 'components/Buttons/CreateButton';
import { Modal } from 'components/Modals/Modal';
import { SaveButton } from 'components/Buttons/SaveButton';

const CreateBlacklistModal = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const modalProps = useDisclosure();
  const createDevice = useCreateBlacklist();
  const [serialNumber, setSerialNumber] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');

  const onSave = () => {
    createDevice.mutate(
      { serialNumber: serialNumber.toLowerCase(), reason },
      {
        onSuccess: () => {
          toast({
            id: 'add-blacklist-success',
            title: t('common.success'),
            description: t('controller.devices.added_blacklist'),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
          modalProps.onClose();
        },
      },
    );
  };

  const isSerialValid = serialNumber.length === 12 && serialNumber.match('^[a-fA-F0-9]+$') !== null;

  React.useEffect(() => {
    setSerialNumber('');
    setReason('');
  }, [modalProps.isOpen]);

  return (
    <>
      <CreateButton onClick={modalProps.onOpen} isCompact ml={2} />
      <Modal
        {...modalProps}
        title={t('controller.devices.add_blacklist')}
        topRightButtons={<SaveButton onClick={onSave} isLoading={createDevice.isLoading} isCompact />}
      >
        <>
          {createDevice.error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>{t('common.error')}</AlertTitle>
                {
                  // @ts-ignore
                  <AlertDescription>{createDevice.error?.response?.data?.ErrorDescription}</AlertDescription>
                }
              </Box>
            </Alert>
          )}
          <FormControl isInvalid={!isSerialValid} mb={2}>
            <FormLabel>{t('inventory.serial_number')}</FormLabel>
            <Input type="text" onChange={(e) => setSerialNumber(e.target.value)} value={serialNumber} w="140px" />
            <FormErrorMessage>{t('inventory.invalid_serial_number')}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>{t('controller.devices.reason')}</FormLabel>
            <Textarea onChange={(e) => setReason(e.target.value)} value={reason} minH="200px" h="auto" />
          </FormControl>
        </>
      </Modal>
    </>
  );
};

export default CreateBlacklistModal;

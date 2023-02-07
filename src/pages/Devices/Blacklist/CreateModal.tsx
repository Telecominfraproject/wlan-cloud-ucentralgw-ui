import * as React from 'react';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea, useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CreateButton } from 'components/Buttons/CreateButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { Modal } from 'components/Modals/Modal';
import { useCreateBlacklist } from 'hooks/Network/Blacklist';
import { AxiosError } from 'models/Axios';

const CreateBlacklistModal = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const initialRef = React.useRef<HTMLInputElement>(null);
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
        onError: (e) => {
          toast({
            id: 'add-blacklist-error',
            title: t('common.error'),
            description: (e as AxiosError)?.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        },
      },
    );
  };

  const isSerialValid = serialNumber.length === 12 && serialNumber.match('^[a-fA-F0-9]+$') !== null;

  const onOpen = () => {
    setSerialNumber('');
    setReason('');
    modalProps.onOpen();
    setTimeout(() => {
      initialRef.current?.focus();
    }, 200);
  };

  return (
    <>
      <CreateButton onClick={onOpen} isCompact ml={2} />
      <Modal
        {...modalProps}
        title={t('controller.devices.add_blacklist')}
        topRightButtons={<SaveButton onClick={onSave} isLoading={createDevice.isLoading} isCompact />}
      >
        <>
          <FormControl isInvalid={!isSerialValid} mb={2}>
            <FormLabel>{t('inventory.serial_number')}</FormLabel>
            <Input
              type="text"
              onChange={(e) => setSerialNumber(e.target.value)}
              value={serialNumber}
              w="140px"
              ref={initialRef}
            />
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

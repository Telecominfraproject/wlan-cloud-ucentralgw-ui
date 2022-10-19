import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SaveButton } from 'components/Buttons/SaveButton';
import { Modal } from 'components/Modals/Modal';
import { BlacklistDevice, useUpdateBlacklist } from 'hooks/Network/Blacklist';

type Props = {
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
  device?: BlacklistDevice;
};
const EditBlacklistModal = ({ modalProps, device }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const updateDevice = useUpdateBlacklist();
  const [newReason, setNewReason] = React.useState<string>(device?.reason ?? '');

  const onSave = () => {
    updateDevice.mutate(
      { serialNumber: device?.serialNumber ?? '', reason: newReason },
      {
        onSuccess: () => {
          updateDevice.reset();
          toast({
            id: 'edit-blacklist-success',
            title: t('common.success'),
            description: t('controller.devices.updated_blacklist'),
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

  React.useEffect(() => {
    setNewReason(device?.reason ?? '');
  }, [device]);

  return (
    <Modal
      {...modalProps}
      title={t('controller.devices.blacklist_update', { serialNumber: device?.serialNumber })}
      topRightButtons={<SaveButton onClick={onSave} isLoading={updateDevice.isLoading} isCompact />}
    >
      <>
        {updateDevice.error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>{t('common.error')}</AlertTitle>
              {
                // @ts-ignore
                <AlertDescription>{updateDevice.error?.response?.data?.ErrorDescription}</AlertDescription>
              }
            </Box>
          </Alert>
        )}
        <FormControl>
          <FormLabel>{t('controller.devices.reason')}</FormLabel>
          <Textarea onChange={(e) => setNewReason(e.target.value)} value={newReason} minH="200px" h="auto" />
        </FormControl>
      </>
    </Modal>
  );
};

export default EditBlacklistModal;

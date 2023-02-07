import React, { Ref, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useBoolean,
  Center,
  Spinner,
  FormControl,
  FormLabel,
  Switch,
  Heading,
} from '@chakra-ui/react';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import ConfirmIgnoreCommand from '../ConfirmIgnoreCommand';
import FirmwareList from './FirmwareList';
import { CloseButton } from 'components/Buttons/CloseButton';
import { ModalHeader } from 'components/Containers/Modal/ModalHeader';
import { SignatureField } from 'components/Form/Fields/SignatureField';
import { useGetDevice } from 'hooks/Network/Devices';
import { useGetAvailableFirmware, useUpdateDeviceFirmware } from 'hooks/Network/Firmware';
import useCommandModal from 'hooks/useCommandModal';
import { ModalProps } from 'models/Modal';

export type FirmwareUpgradeModalProps = {
  modalProps: ModalProps;
  serialNumber: string;
};

export const FirmwareUpgradeModal = ({ modalProps: { isOpen, onClose }, serialNumber }: FirmwareUpgradeModalProps) => {
  const { t } = useTranslation();
  const [formKey, setFormKey] = React.useState(uuid());
  const ref = useRef<
    | FormikProps<{
        signature?: string | undefined;
      }>
    | undefined
  >();
  const [isRedirector, { toggle }] = useBoolean(false);
  const { data: device, isFetching: isFetchingDevice } = useGetDevice({ serialNumber, onClose });
  const { data: firmware, isFetching: isFetchingFirmware } = useGetAvailableFirmware({
    deviceType: device?.compatible ?? '',
  });
  const { mutateAsync: upgrade, isLoading: isUpgrading } = useUpdateDeviceFirmware({
    serialNumber,
    onClose,
  });
  const { isConfirmOpen, closeConfirm, closeModal, closeCancelAndForm } = useCommandModal({
    isLoading: isUpgrading,
    onModalClose: onClose,
  });

  const submit = (uri: string) => {
    upgrade({
      keepRedirector: isRedirector,
      uri,
      signature:
        device?.restrictedDevice && !device?.restrictionDetails?.developer ? ref.current?.values?.signature : undefined,
    });
  };

  React.useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Modal onClose={closeModal} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth={{ sm: '90%', md: '900px', lg: '1000px', xl: '80%' }}>
        <ModalHeader
          title={`${t('commands.firmware_upgrade')} #${serialNumber}`}
          right={<CloseButton ml={2} onClick={closeModal} />}
        />
        <ModalBody>
          {isUpgrading || isFetchingDevice || isFetchingFirmware ? (
            <Center>
              <Spinner size="lg" />
            </Center>
          ) : (
            <>
              <Heading size="sm" mb={4}>
                {t('devices.current_firmware')}: {device?.firmware}
              </Heading>
              <FormControl>
                <FormLabel ms="4px" fontSize="md" fontWeight="normal">
                  {t('commands.keep_redirector')}
                </FormLabel>
                <Switch isChecked={isRedirector} onChange={toggle} borderRadius="15px" size="lg" />
              </FormControl>
              {device?.restrictedDevice && !device?.restrictionDetails?.developer && (
                <Formik<{ signature?: string }>
                  innerRef={ref as Ref<FormikProps<{ signature?: string | undefined }>> | undefined}
                  key={formKey}
                  enableReinitialize
                  initialValues={{
                    signature: undefined,
                  }}
                  onSubmit={() => {}}
                >
                  <SignatureField name="signature" />
                </Formik>
              )}
              {firmware?.firmwares && (
                <FirmwareList firmware={firmware.firmwares} upgrade={submit} isLoading={isUpgrading} />
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
      <ConfirmIgnoreCommand
        modalProps={{ isOpen: isConfirmOpen, onOpen: () => {}, onClose: closeConfirm }}
        confirm={closeCancelAndForm}
        cancel={closeConfirm}
      />
    </Modal>
  );
};

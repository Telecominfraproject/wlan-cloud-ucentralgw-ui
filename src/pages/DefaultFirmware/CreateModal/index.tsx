import React from 'react';
import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { ArrowRight } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ConfirmDefaultFirmwareCreation from './ConfirmDefaultFirmwareCreation';
import CreateDefaultFirmwareResults from './CreateDefaultFirmwareResults';
import DeviceTypeSelection from './DeviceTypeSelection';
import DefaultFirmwareRevisionSelection from './SelectRevision';
import { CreateDefaultFirmwareResult, createDefaultFirmwareBatch } from './utils';
import { CreateButton } from 'components/Buttons/CreateButton';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { Modal } from 'components/Modals/Modal';
import { DefaultFirmware } from 'hooks/Network/DefaultFirmware';

const CreateDefaultFirmwareModal = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState<'device_type' | 'revision' | 'confirm' | 'result'>(
    'device_type',
  );
  const modalProps = useDisclosure();
  const closeConfirmModal = useDisclosure();
  const [deviceTypes, setDeviceTypes] = React.useState<string[]>([]);
  const [revision, setRevision] = React.useState<string>('');
  const [results, setResults] = React.useState<CreateDefaultFirmwareResult[]>([]);
  const [nextCallback, setNextCallback] = React.useState<() => (Promise<void> | void) | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  const closeCancelAndForm = () => {
    modalProps.onClose();
    closeConfirmModal.onClose();
    setCurrentStep('device_type');
    setDeviceTypes([]);
    setRevision('');
    setResults([]);
  };

  const onClose = () => {
    if (currentStep === 'device_type' || currentStep === 'result') {
      closeCancelAndForm();
    } else {
      closeConfirmModal.onOpen();
    }
  };

  const finishDeviceType = (newDeviceTypes: string[]) => {
    setDeviceTypes(newDeviceTypes);
    setCurrentStep('revision');
    setNextCallback(undefined);
  };

  const finishRevision = (newRevision: string) => {
    setRevision(newRevision);
    setCurrentStep('confirm');
    setNextCallback(undefined);
  };

  const startCreation = async (defaults: DefaultFirmware[]) => {
    setIsLoading(true);
    const newResults = await createDefaultFirmwareBatch(defaults);
    setIsLoading(false);
    queryClient.invalidateQueries(['default_firmwares']);
    setResults(newResults);
    setCurrentStep('result');
    setNextCallback(undefined);
  };

  return (
    <>
      <CreateButton onClick={modalProps.onOpen} mr={2} />
      <Modal
        {...modalProps}
        onClose={onClose}
        title={`${t('common.create')} ${t('common.default')} ${t('firmware.one')}`}
        topRightButtons={
          currentStep === 'result' ? null : (
            <Button
              onClick={nextCallback}
              isDisabled={nextCallback === undefined}
              rightIcon={<ArrowRight />}
              colorScheme="blue"
              isLoading={isLoading}
            >
              {currentStep === 'confirm' ? t('common.start') : t('common.next')}
            </Button>
          )
        }
      >
        <Box pb={8}>
          {currentStep === 'device_type' ? (
            <DeviceTypeSelection goNext={finishDeviceType} setNextCallback={setNextCallback} />
          ) : null}
          {currentStep === 'revision' ? (
            <DefaultFirmwareRevisionSelection
              deviceTypes={deviceTypes}
              goNext={finishRevision}
              setNextCallback={setNextCallback}
            />
          ) : null}
          {currentStep === 'confirm' ? (
            <ConfirmDefaultFirmwareCreation
              deviceTypes={deviceTypes}
              revision={revision}
              goNext={startCreation}
              setNextCallback={setNextCallback}
            />
          ) : null}
          {currentStep === 'result' ? <CreateDefaultFirmwareResults results={results} /> : null}
        </Box>
      </Modal>
      <ConfirmCloseAlertModal
        isOpen={closeConfirmModal.isOpen}
        confirm={closeCancelAndForm}
        cancel={closeConfirmModal.onClose}
      />
    </>
  );
};

export default CreateDefaultFirmwareModal;

import React, { useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import GoogleAuthenticatorActivationSuccess from './GoogleAuthenticatorActivationSuccess';
import GoogleAuthenticatorIntro from './GoogleAuthenticatorIntro';
import GoogleAuthenticatorQrDisplay from './GoogleAuthenticatorQrDisplay';
import GoogleAuthenticatorTests from './GoogleAuthenticatorTests';
import { SaveButton } from 'components/Buttons/SaveButton';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { ModalHeader } from 'components/Modals/GenericModal/ModalHeader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GoogleAuthenticatorModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState('intro');
  const { isOpen: showConfirm, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();

  const closeCancelAndForm = () => {
    onClose();
    closeConfirm();
    setCurrentStep('intro');
  };

  const onActivated = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal onClose={openConfirm} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          title={t('account.activating_google_authenticator')}
          right={
            <>
              <SaveButton onClick={onActivated} isDisabled={currentStep !== 'activated'} />
              <CloseButton ml={2} onClick={openConfirm} />
            </>
          }
        />
        <ModalBody>
          {currentStep === 'intro' && <GoogleAuthenticatorIntro setCurrentStep={setCurrentStep} />}
          {currentStep === 'qr-code' && <GoogleAuthenticatorQrDisplay setCurrentStep={setCurrentStep} />}
          {currentStep === 'tests' && <GoogleAuthenticatorTests setCurrentStep={setCurrentStep} />}
          {currentStep === 'activated' && <GoogleAuthenticatorActivationSuccess onSuccess={onActivated} />}
        </ModalBody>
      </ModalContent>
      <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </Modal>
  );
};

export default GoogleAuthenticatorModal;

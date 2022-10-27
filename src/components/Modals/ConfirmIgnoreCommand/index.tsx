import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'models/Modal';

interface Props {
  modalProps: ModalProps;
  confirm: () => void;
  cancel: () => void;
}

const ConfirmIgnoreCommand: React.FC<Props> = ({ modalProps: { isOpen }, confirm, cancel }) => {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} onClose={cancel} leastDestructiveRef={cancelRef} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{t('commands.abort_command_title')}</AlertDialogHeader>
          <AlertDialogBody>{t('commands.abort_command_explanation')}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={cancel} mr={4}>
              {t('common.cancel')}
            </Button>
            <Button onClick={confirm} colorScheme="red">
              {t('common.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ConfirmIgnoreCommand;

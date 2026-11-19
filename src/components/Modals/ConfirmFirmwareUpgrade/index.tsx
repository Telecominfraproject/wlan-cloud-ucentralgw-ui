// ABOUTME: Confirmation dialog shown before a firmware upgrade is sent to a device.
// ABOUTME: The upgrade only proceeds when the user explicitly confirms.
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

interface Props {
  isOpen: boolean;
  explanation: string;
  confirm: () => void;
  cancel: () => void;
}

const ConfirmFirmwareUpgrade: React.FC<Props> = ({ isOpen, explanation, confirm, cancel }) => {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} onClose={cancel} leastDestructiveRef={cancelRef} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{t('commands.confirm_firmware_upgrade_title')}</AlertDialogHeader>
          <AlertDialogBody wordBreak="break-word">{explanation}</AlertDialogBody>
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

export default ConfirmFirmwareUpgrade;

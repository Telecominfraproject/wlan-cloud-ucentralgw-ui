import React, { LegacyRef, RefObject, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { FocusableElement } from '@chakra-ui/utils';
import { useTranslation } from 'react-i18next';

export interface ConfirmCloseAlertProps {
  isOpen: boolean;
  confirm: () => void;
  cancel: () => void;
  labelObj?: {
    header: string;
    body: string;
  };
}

const _ConfirmCloseAlert: React.FC<ConfirmCloseAlertProps> = ({ isOpen, confirm, cancel, labelObj }) => {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement | undefined>();

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={() => {}}
      leastDestructiveRef={cancelRef as RefObject<FocusableElement>}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{labelObj ? labelObj.header : t('common.discard_changes')}</AlertDialogHeader>
          <AlertDialogBody>{labelObj ? labelObj.body : t('crud.confirm_cancel')}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef as LegacyRef<HTMLButtonElement> | undefined} onClick={cancel} mr={4}>
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

export const ConfirmCloseAlertModal = React.memo(_ConfirmCloseAlert);

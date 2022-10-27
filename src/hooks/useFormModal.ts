import { useMemo } from 'react';
import { useDisclosure } from '@chakra-ui/react';

export type UseFormModalProps = {
  isDirty?: boolean;
  onModalClose?: () => void;
};

export const useFormModal = ({ isDirty, onModalClose }: UseFormModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();

  const closeModal = () => {
    if (isDirty) openConfirm();
    else if (onModalClose) onModalClose();
    else onClose();
  };

  const closeCancelAndForm = () => {
    closeConfirm();
    if (onModalClose) onModalClose();
    else onClose();
  };

  const toReturn = useMemo(
    () => ({
      onOpen,
      isOpen,
      isConfirmOpen,
      closeModal,
      closeConfirm,
      closeCancelAndForm,
    }),
    [isOpen, isConfirmOpen, isDirty],
  );

  return toReturn;
};

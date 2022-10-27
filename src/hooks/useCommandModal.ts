import { useMemo } from 'react';
import { useDisclosure } from '@chakra-ui/react';

interface Props {
  isLoading?: boolean;
  onModalClose?: () => void;
}
const useCommandModal = ({ isLoading, onModalClose }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();

  const closeModal = () => {
    if (isLoading) openConfirm();
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
    [isOpen, isConfirmOpen, isLoading],
  );

  return toReturn;
};

export default useCommandModal;

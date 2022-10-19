import React from 'react';
import { Button, IconButton, Tooltip, useBreakpoint, useDisclosure } from '@chakra-ui/react';
import { Pencil, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { ConfirmCloseAlertModal } from '../../Modals/ConfirmCloseAlert';

export interface ToggleEditButtonProps {
  toggleEdit: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  isEditing: boolean;
  isDirty?: boolean;
  ml?: string | number;
}

const _ToggleEditButton: React.FC<ToggleEditButtonProps> = ({
  toggleEdit,
  isEditing,
  isDirty,
  isDisabled,
  isLoading,
  isCompact,
  ml,
  ...props
}) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const { isOpen: showConfirm, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();

  const toggle = () => {
    if (isEditing && isDirty) {
      openConfirm();
    } else {
      toggleEdit();
    }
  };

  const closeCancelAndForm = () => {
    closeConfirm();
    toggleEdit();
  };

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <>
        <Button
          colorScheme="gray"
          type="button"
          onClick={toggle}
          rightIcon={isEditing ? <X size={20} /> : <Pencil size={20} />}
          isLoading={isLoading}
          isDisabled={isDisabled}
          ml={ml}
          {...props}
        >
          {isEditing ? t('common.stop_editing') : t('common.edit')}
        </Button>
        <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
      </>
    );
  }
  return (
    <>
      <Tooltip label={isEditing ? t('common.stop_editing') : t('common.edit')}>
        <IconButton
          aria-label="toggle-edit"
          colorScheme="gray"
          type="button"
          onClick={toggle}
          icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
          isLoading={isLoading}
          isDisabled={isDisabled}
          ml={ml}
          {...props}
        />
      </Tooltip>
      <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export const ToggleEditButton = React.memo(_ToggleEditButton);

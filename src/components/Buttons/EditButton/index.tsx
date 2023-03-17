import React from 'react';
import { IconButton, Button, Tooltip, useBreakpoint } from '@chakra-ui/react';
import { Pen } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export interface EditButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  label?: string;
  ml?: string | number;
}

const _EditButton: React.FC<EditButtonProps> = ({
  onClick,
  label,
  isDisabled,
  isLoading,
  isCompact = true,
  ...props
}) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <Button
        colorScheme="gray"
        onClick={onClick}
        rightIcon={<Pen size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      >
        {label ?? t('common.edit')}
      </Button>
    );
  }
  return (
    <Tooltip label={label ?? t('common.edit')} hasArrow>
      <IconButton
        aria-label="edit"
        colorScheme="gray"
        onClick={onClick}
        icon={<Pen size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      />
    </Tooltip>
  );
};

export const EditButton = React.memo(_EditButton);

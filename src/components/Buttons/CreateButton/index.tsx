import React from 'react';
import { Button, IconButton, Tooltip, useBreakpoint, SpaceProps } from '@chakra-ui/react';
import { Plus } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export interface CreateButtonProps extends SpaceProps {
  onClick?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  label?: string;
}

const _CreateButton: React.FC<CreateButtonProps> = ({ onClick, isDisabled, isLoading, isCompact, label, ...props }) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <Button
        colorScheme="blue"
        type="button"
        onClick={onClick}
        rightIcon={<Plus size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      >
        {label ?? t('common.create')}
      </Button>
    );
  }
  return (
    <Tooltip label={label ?? t('common.create')}>
      <IconButton
        aria-label="Create"
        colorScheme="blue"
        type="button"
        onClick={onClick}
        icon={<Plus size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      />
    </Tooltip>
  );
};

export const CreateButton = React.memo(_CreateButton);

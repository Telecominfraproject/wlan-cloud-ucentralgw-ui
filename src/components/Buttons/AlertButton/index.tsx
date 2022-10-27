import React from 'react';
import { Button, IconButton, Tooltip, useBreakpoint } from '@chakra-ui/react';
import { Warning } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { ThemeProps } from 'models/Theme';

export interface AlertButtonProps extends ThemeProps {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  label?: string;
}

const _AlertButton: React.FC<AlertButtonProps> = ({ onClick, isDisabled, isLoading, isCompact, label, ...props }) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <Button
        colorScheme="red"
        type="button"
        onClick={onClick}
        rightIcon={<Warning size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      >
        {label ?? t('common.alert')}
      </Button>
    );
  }
  return (
    <Tooltip label={label ?? t('common.alert')}>
      <IconButton
        aria-label="alert-button"
        colorScheme="red"
        type="button"
        onClick={onClick}
        icon={<Warning size={20} />}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      />
    </Tooltip>
  );
};

export const AlertButton = React.memo(_AlertButton);

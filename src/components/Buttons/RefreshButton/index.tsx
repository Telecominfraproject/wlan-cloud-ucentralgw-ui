import React from 'react';
import { Button, IconButton, Tooltip, useBreakpoint } from '@chakra-ui/react';
import { ArrowsClockwise } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export interface RefreshButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  isFetching?: boolean;
  isCompact?: boolean;
  ml?: string | number;
  size?: 'sm' | 'md' | 'lg';
}

const _RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isDisabled,
  isFetching,
  isCompact,
  ml,
  size,
  ...props
}) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <Button
        minWidth="112px"
        colorScheme="gray"
        onClick={onClick}
        rightIcon={<ArrowsClockwise size={20} />}
        isDisabled={isDisabled}
        isLoading={isFetching}
        ml={ml}
        size={size}
        {...props}
      >
        {t('common.refresh')}
      </Button>
    );
  }

  return (
    <Tooltip label={t('common.refresh')}>
      <IconButton
        aria-label="refresh"
        colorScheme="gray"
        onClick={onClick}
        icon={<ArrowsClockwise size={20} />}
        isDisabled={isDisabled}
        isLoading={isFetching}
        ml={ml}
        {...props}
      />
    </Tooltip>
  );
};

export const RefreshButton = React.memo(_RefreshButton);

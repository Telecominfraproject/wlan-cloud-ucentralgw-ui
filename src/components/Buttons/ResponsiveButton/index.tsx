import React from 'react';
import { Button, IconButton, SpaceProps, Tooltip, useBreakpoint } from '@chakra-ui/react';

export interface ResponsiveButtonProps extends SpaceProps {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  color: string;
  label: string;
  icon?: React.ReactElement;
}

const _ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  onClick,
  isDisabled,
  isLoading,
  isCompact,
  color,
  label,
  icon,
  ...props
}) => {
  const breakpoint = useBreakpoint();

  if (!isCompact && breakpoint !== 'base' && breakpoint !== 'sm') {
    return (
      <Button
        colorScheme={color}
        type="button"
        onClick={onClick}
        // @ts-ignore
        rightIcon={icon}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      >
        {label}
      </Button>
    );
  }
  return (
    <Tooltip label={label}>
      <IconButton
        aria-label={label}
        colorScheme={color}
        type="button"
        onClick={onClick}
        // @ts-ignore
        icon={icon}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      />
    </Tooltip>
  );
};

export const ResponsiveButton = React.memo(_ResponsiveButton);

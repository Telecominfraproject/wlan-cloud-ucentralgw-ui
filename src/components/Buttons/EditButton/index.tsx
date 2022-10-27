import React from 'react';
import { IconButton, Button, Tooltip, useBreakpoint } from '@chakra-ui/react';
import { Pen } from 'phosphor-react';

export interface EditButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCompact?: boolean;
  label?: string;
  ml?: string | number;
}

const _EditButton: React.FC<EditButtonProps> = ({ onClick, label, isDisabled, isLoading, isCompact, ...props }) => {
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
        {label}
      </Button>
    );
  }
  return (
    <Tooltip label={label}>
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

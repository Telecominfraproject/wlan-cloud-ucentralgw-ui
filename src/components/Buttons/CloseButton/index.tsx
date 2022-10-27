import React from 'react';
import { IconButton, SpaceProps } from '@chakra-ui/react';
import { X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export interface CloseButtonProps extends SpaceProps {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const _CloseButton: React.FC<CloseButtonProps> = ({ onClick, isDisabled, isLoading, ...props }) => {
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={t('common.close')}
      colorScheme="gray"
      onClick={onClick}
      icon={<X size={20} />}
      isLoading={isLoading}
      isDisabled={isDisabled}
      {...props}
    />
  );
};

export const CloseButton = React.memo(_CloseButton);

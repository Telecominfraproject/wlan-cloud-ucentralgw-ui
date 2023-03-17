import React from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip, useToast } from '@chakra-ui/react';
import { Wrench } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { useResetMfa, useResetPassword, useSendUserEmailValidation, useSuspendUser } from 'hooks/Network/Users';
import { useMutationResult } from 'hooks/useMutationResult';
import { AxiosError } from 'models/Axios';

interface Props {
  id: string;
  isSuspended: boolean;
  isWaitingForCheck: boolean;
  refresh: () => void;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserActions = ({ id, isSuspended, isWaitingForCheck, refresh, size = 'sm', isDisabled }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { mutateAsync: sendValidation } = useSendUserEmailValidation({ id, refresh });
  const { mutateAsync: suspend } = useSuspendUser({ id });
  const { mutateAsync: resetMfa } = useResetMfa({ id });
  const { mutateAsync: resetPassword } = useResetPassword({ id });
  const { onSuccess, onError } = useMutationResult({
    objName: t('users.one'),
    operationType: 'update',
  });

  const handleSuspendClick = () =>
    suspend(!isSuspended, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (e) => {
        onError(e as AxiosError);
      },
    });
  const handleResetMfaClick = () =>
    resetMfa(undefined, {
      onSuccess: () => {
        toast({
          id: `reset-mfa-success-${uuid()}`,
          title: t('common.success'),
          description: t('users.reset_mfa_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e) => {
        onError(e as AxiosError);
      },
    });

  const handleResetPasswordClick = () =>
    resetPassword(undefined, {
      onSuccess: () => {
        toast({
          id: `reset-password-success-${uuid()}`,
          title: t('common.success'),
          description: t('users.reset_password_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e) => {
        onError(e as AxiosError);
      },
    });

  const handleValidationClick = () => sendValidation();

  return (
    <Menu>
      <Tooltip label={t('common.actions')}>
        <MenuButton
          as={IconButton}
          aria-label="Commands"
          icon={<Wrench size={20} />}
          size={size}
          ml={2}
          isDisabled={isDisabled}
        />
      </Tooltip>
      <MenuList fontSize="md">
        <MenuItem onClick={handleSuspendClick}>
          {isSuspended ? t('users.reactivate_user') : t('users.suspend')}
        </MenuItem>
        <MenuItem onClick={handleValidationClick}>
          {isWaitingForCheck ? t('users.send_validation') : t('users.re_validate_email')}
        </MenuItem>
        <MenuItem onClick={handleResetMfaClick}>{t('users.reset_mfa')}</MenuItem>
        <MenuItem onClick={handleResetPasswordClick}>{t('users.reset_password')}</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default React.memo(UserActions);

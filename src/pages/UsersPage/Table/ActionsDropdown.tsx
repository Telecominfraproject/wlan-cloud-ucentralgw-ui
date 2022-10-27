import React from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { Wrench } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { useSendUserEmailValidation, useSuspendUser, useResetMfa, useResetPassword } from 'hooks/Network/Users';
import { useMutationResult } from 'hooks/useMutationResult';

interface Props {
  id: string;
  isSuspended: boolean;
  isWaitingForCheck: boolean;
  refresh: () => void;
}

const UserActions: React.FC<Props> = ({ id, isSuspended, isWaitingForCheck, refresh }) => {
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
        if (axios.isAxiosError(e)) onError(e);
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
        if (axios.isAxiosError(e)) onError(e);
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
        if (axios.isAxiosError(e)) onError(e);
      },
    });

  const handleValidationClick = () => sendValidation();

  return (
    <Menu>
      <Tooltip label={t('commands.other')}>
        <MenuButton as={IconButton} aria-label="Commands" icon={<Wrench size={20} />} size="sm" ml={2} />
      </Tooltip>
      <MenuList>
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

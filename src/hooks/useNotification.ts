import * as React from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { isApiError } from 'models/Axios';

export type SuccessNotificationProps = {
  description: string;
  id?: string;
};

export type ApiErrorNotificationProps = {
  e: unknown;
  fallbackMessage?: string;
  id?: string;
};

export const useNotification = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const successToast = ({ description, id }: SuccessNotificationProps) => {
    toast({
      id: id ?? uuid(),
      title: t('common.success'),
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const apiErrorToast = ({ e, id, fallbackMessage }: ApiErrorNotificationProps) => {
    if (isApiError(e)) {
      toast({
        id: id ?? uuid(),
        title: t('common.error'),
        description: e.response?.data.ErrorDescription,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } else {
      toast({
        id: id ?? uuid(),
        title: t('common.error'),
        description: fallbackMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const errorToast = ({ description, id }: SuccessNotificationProps) => {
    toast({
      id: id ?? uuid(),
      title: t('common.error'),
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  return React.useMemo(
    () => ({
      successToast,
      errorToast,
      apiErrorToast,
    }),
    [t],
  );
};

export type UseNotificationReturn = ReturnType<typeof useNotification>;

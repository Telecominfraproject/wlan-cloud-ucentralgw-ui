import { useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { AxiosError } from 'models/Axios';

export type UseMutationResultProps = {
  objName: string;
  operationType: 'update' | 'delete' | 'create' | 'blink' | 'reboot';
  refresh?: () => void;
  onClose?: () => void;
  queryToInvalidate?: string[];
};

export const useMutationResult = ({
  objName,
  operationType,
  refresh = () => {},
  onClose = () => {},
  queryToInvalidate,
}: UseMutationResultProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const successDescription = () => {
    if (operationType === 'update')
      return t('crud.success_update_obj', {
        obj: objName,
      });
    if (operationType === 'delete')
      return t('crud.success_delete_obj', {
        obj: objName,
      });
    if (operationType === 'blink')
      return t('commands.blink_success', {
        obj: objName,
      });
    if (operationType === 'reboot')
      return t('commands.reboot_success', {
        obj: objName,
      });
    return t('crud.success_create_obj', {
      obj: objName,
    });
  };
  const errorDescription = (e: AxiosError) => {
    if (operationType === 'update')
      return t('crud.error_update_obj', {
        obj: objName,
        e: e?.response?.data?.ErrorDescription,
      });
    if (operationType === 'delete')
      t('crud.error_delete_obj', {
        obj: objName,
        e: e?.response?.data?.ErrorDescription,
      });

    if (operationType === 'blink')
      return t('commands.blink_error', {
        obj: objName,
        e: e?.response?.data?.ErrorDescription,
      });
    if (operationType === 'reboot')
      return t('commands.reboot_error', {
        obj: objName,
        e: e?.response?.data?.ErrorDescription,
      });
    return t('crud.error_create_obj', {
      obj: objName,
      e: e?.response?.data?.ErrorDescription,
    });
  };

  const onSuccess = useCallback(
    ({ setSubmitting, resetForm }: { setSubmitting?: (v: boolean) => void; resetForm?: () => void } = {}) => {
      if (refresh) refresh();
      if (setSubmitting) setSubmitting(false);
      if (resetForm) resetForm();
      toast({
        id: `${objName}-${operationType}-success-${uuid()}`,
        title: t('common.success'),
        description: successDescription(),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      if (onClose) onClose();
      if (queryToInvalidate) queryClient.invalidateQueries(queryToInvalidate);
    },
    [queryToInvalidate],
  );

  const onError = useCallback((e: AxiosError, { setSubmitting }: { setSubmitting?: (v: boolean) => void } = {}) => {
    toast({
      id: uuid(),
      title: t('common.error'),
      description: errorDescription(e),
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
    if (setSubmitting) setSubmitting(false);
  }, []);

  const toReturn = useMemo(
    () => ({
      onSuccess,
      onError,
    }),
    [],
  );

  return toReturn;
};

import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosGw } from 'constants/axiosInstances';

export type ReEnrollRequest = {
  serialNumber: string;
  when?: number;
};

export type ReEnrollResponse = {
  UUID: string;
  command: 're-enroll' | 'reenroll';
  completed: number;
  custom: number;
  details: {
    serial: string;
    when: number;
  };
  errorCode: number;
  errorText: string;
  executed: number;
  executionTime: number;
  results: {
    serial: string;
    status: {
      error: number;
      resultCode: number;
      resultText: string;
      text: string;
    };
  };
  serialNumber: string;
  status: string;
  submitted: number;
  submittedBy: string;
  when: number;
};

const reEnrollDevice = async ({ serialNumber, when = 0 }: ReEnrollRequest) =>
  axiosGw.post<ReEnrollResponse>(`device/${serialNumber}/reenroll`, {
    serial: serialNumber,
    when,
  });

export const useReEnroll = ({ serialNumber }: { serialNumber: string }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(reEnrollDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['commands', serialNumber]);
      queryClient.invalidateQueries(['device', serialNumber]);
      queryClient.invalidateQueries(['device-status', serialNumber]);
      toast({
        id: `re-enroll-success-${serialNumber}`,
        title: t('common.success'),
        description: t('controller.devices.re_enroll_initiated', { serialNumber }),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      toast({
        id: `re-enroll-error-${serialNumber}`,
        title: t('common.error'),
        description: error?.response?.data?.ErrorDescription || t('common.error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });
};

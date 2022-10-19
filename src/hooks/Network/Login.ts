import { useToast } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { axiosSec } from 'constants/axiosInstances';

export interface ChangePasswordRequest {
  userId: string;
  password: string;
  newPassword: string;
}

export const useChangePassword = () =>
  useMutation((loginInfo: ChangePasswordRequest) => axiosSec.post(`oauth2`, loginInfo));
export const useForgotPassword = () =>
  useMutation((info: { userId: string }) => axiosSec.post(`oauth2?forgotPassword=true`, info));
export const useLogin = () =>
  useMutation((loginInfo: { userId: string; password: string }) => axiosSec.post('oauth2', loginInfo));
export const useSendVerifyCode = () =>
  useMutation((verifInfo: { uuid: string; answer: string }) =>
    axiosSec.post('oauth2?completeMFAChallenge=true', verifInfo),
  );
export const useSendPhoneCode = ({ uuid }: { uuid: string }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(
    () =>
      axiosSec.post(`oauth2?resendMFACode=true`, {
        uuid,
      }),
    {
      onSuccess: () => {
        toast({
          id: 'verif-phone-success',
          title: t('common.success'),
          description: t('login.resent_code'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e: AxiosError) => {
        toast({
          id: 'verif-phone-error',
          title: t('common.error'),
          description: t('login.error_sending_code', { e: e?.response?.data?.ErrorDescription }),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    },
  );
};

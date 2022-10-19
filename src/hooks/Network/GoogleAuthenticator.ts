import { Buffer } from 'buffer';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { axiosSec } from 'constants/axiosInstances';

export const useGetGoogleAuthenticatorQrCode = () => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(
    ['get-authenticator-qr'],
    () =>
      axiosSec
        .get('totp?reset=true', { responseType: 'arraybuffer' })
        .then(({ data }) => Buffer.from(data, 'binary').toString()),
    {
      onError: (e: AxiosError) => {
        if (!toast.isActive('get-authenticator-qr'))
          toast({
            id: 'get-authenticator-qr',
            title: t('common.error'),
            description: t('account.error_fetching_qr', {
              e: e?.response?.data?.ErrorDescription,
            }),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
      },
    },
  );
};

export const useVerifyAuthenticator = () =>
  useMutation(({ code, index }: { code: string; index: number }) =>
    axiosSec.put(`totp?index=${index}&value=${code}`, {}),
  );

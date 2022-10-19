import { Dispatch, SetStateAction } from 'react';
import { useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { v4 as uuid } from 'uuid';
import { axiosSec } from 'constants/axiosInstances';
import { Preference } from 'models/Preference';
import { User } from '../../models/User';
import { Note } from 'models/Note';

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation((newPreferences: Preference[]) => axiosSec.put(`preferences`, { data: newPreferences }), {
    onSuccess: ({ data: { data: preferences } }: { data: { data: Preference[] } }) => {
      queryClient.setQueryData(['get-user-preferences'], preferences);
    },
  });
};

export const useGetPreferences = ({ enabled }: { enabled?: boolean }) =>
  useQuery(
    ['get-user-preferences'],
    () =>
      axiosSec
        .get('preferences')
        .then(({ data: { data: preferences } }: { data: { data: Preference[] } }) => preferences),
    {
      enabled,
    },
  );

export const useGetProfile = () => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(['get-user-profile'], () => axiosSec.get('oauth2?me=true').then(({ data }: { data: User }) => data), {
    enabled: false,
    onError: (e: AxiosError) => {
      if (!toast.isActive('user-fetching-error'))
        toast({
          id: 'user-fetching-error',
          title: t('common.error'),
          description: t('user.error_fetching', { e: e?.response?.data?.ErrorDescription }),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
    },
  });
};

export const useGetAvatar = ({ id, enabled, cache }: { id: string; enabled?: boolean; cache: string }) =>
  useQuery(
    ['get-user-avatar', id, cache],
    () => axiosSec.get(`avatar/${id}?cache=${cache}`, { responseType: 'arraybuffer' }),
    {
      enabled,
    },
  );

export const useDeleteAccountToken = ({
  setCurrentToken,
}: {
  setCurrentToken: Dispatch<SetStateAction<string | undefined>>;
}) =>
  useMutation(
    (token: string) =>
      axiosSec
        .delete(`/oauth2/${token}`)
        .then(() => true)
        .catch(() => false),
    {
      onSettled: () => {
        localStorage.removeItem('access_token');
        sessionStorage.clear();
        setCurrentToken('');
        window.location.replace('/');
      },
    },
  );

export const useSendPhoneTest = () => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(
    (to: string) =>
      axiosSec.post(`sms?validateNumber=true`, {
        to,
      }),
    {
      onSuccess: () => {
        toast({
          id: `send-test-phone-success${uuid()}`,
          title: t('common.success'),
          description: t('common.sent_code'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e: AxiosError) => {
        toast({
          id: 'send-test-phone-error',
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

export const useVerifyCode = ({ phoneNumber }: { phoneNumber: string }) =>
  useMutation((code: string) =>
    axiosSec.post(`sms?completeValidation=true&validationCode=${code}`, {
      to: phoneNumber,
    }),
  );

export const useUpdateAccount = ({ user }: { user?: User }) => {
  const queryClient = useQueryClient();

  return useMutation(
    (userInfo: {
      id?: string;
      name?: string;
      description?: string;
      currentPassword?: string;
      userTypeProprietaryInfo?: {
        authenticatorSecret?: string;
        mfa?: {
          enabled?: boolean;
          method?: 'authenticator' | 'sms' | 'email' | '';
        };
        mobiles?: { number: string }[];
      };
      notes?: Note[];
    }) => axiosSec.put(`user/${user?.id ?? userInfo?.id}`, userInfo),
    {
      onSuccess: (data) => {
        const newUser = {
          ...user,
          ...data.data,
          name: data.data.name,
          description: data.data.description,
          notes: data.data.notes,
          userTypeProprietaryInfo: data.data.userTypeProprietaryInfo,
        };
        queryClient.setQueryData(['get-user-profile'], newUser);
      },
    },
  );
};

export const useDeleteAvatar = ({ user, refetch }: { user: User; refetch?: () => void }) =>
  useMutation(() => axiosSec.delete(`avatar/${user.id}`), {
    onSuccess: () => {
      if (refetch) refetch();
    },
  });

const addAvatar = (userId: string, avatarFile: File) => {
  const data = new FormData();
  data.append('file', avatarFile);
  return axiosSec.post(`/avatar/${userId}`, data);
};

export const useUpdateAvatar = ({ user, refetch }: { user: User; refetch?: () => void }) =>
  useMutation((newAvatar: File) => addAvatar(user.id, newAvatar), {
    onSuccess: () => {
      if (refetch) refetch();
    },
  });

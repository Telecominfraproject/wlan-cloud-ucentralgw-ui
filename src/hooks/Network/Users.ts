import { useToast } from '@chakra-ui/react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosSec } from 'constants/axiosInstances';
import { AxiosError } from 'models/Axios';
import { AtLeast } from 'models/General';
import { Note } from 'models/Note';

export type UserRole =
  | 'root'
  | 'admin'
  | 'subscriber'
  | 'partner'
  | 'csr'
  | 'system'
  | 'installer'
  | 'noc'
  | 'accounting';

export type User = {
  avatar: string;
  blackListed: boolean;
  creationDate: number;
  currentLoginURI: string;
  currentPassword: string;
  description: string;
  email: string;
  id: string;
  lastEmailCheck: number;
  lastLogin: number;
  lastPasswordChange: number;
  lastPasswords: string[];
  locale: string;
  location: string;
  modified: number;
  name: string;
  notes: Note[];
  oauthType: string;
  oauthUserInfo: string;
  owner: string;
  securityPolicy: string;
  securityPolicyChange: number;
  signingUp: string;
  suspended: boolean;
  userRole: UserRole;
  userTypeProprietaryInfo: {
    authenticatorSecret: string;
    mfa: {
      enabled: boolean;
      method?: 'authenticator' | 'sms' | 'email' | '';
    };
    mobiles: { number: string }[];
  };
  validated: boolean;
  validationDate: number;
  validationEmail: string;
  validationURI: string;
  waitingForEmailCheck: boolean;
};

const getAvatarPromises = (userList: User[], queryClient: QueryClient) => {
  const promises = userList.map(async (user) => {
    if (user.avatar !== '' && user.avatar !== '0') {
      // If the avatar is already in the cache, return it
      const cachedAvatar = queryClient.getQueryData(['avatar', user.id, user.avatar]);
      if (cachedAvatar) return cachedAvatar;

      return axiosSec
        .get(`avatar/${user.id}?cache=${user.avatar}`, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          queryClient.setQueryData(['avatar', user.id, user.avatar], response);
          return response;
        })
        .catch((e) => {
          throw e;
        });
    }
    return Promise.resolve('');
  });

  return promises;
};

const getBatchUsers = async (offset: number, limit: number) => {
  const users = await axiosSec
    .get(`users?offset=${offset}&limit=${limit}&withExtendedInfo=true`)
    .then(({ data }) => data.users as User[]);

  return users;
};

const getAllUsers = async () => {
  let users: User[] = [];
  let offset = 0;
  const limit = 500;
  let lastResponseLength = 0;

  do {
    // eslint-disable-next-line no-await-in-loop
    const response = await getBatchUsers(offset, limit);
    users = [...users, ...response];
    offset += limit;
    lastResponseLength = response.length;
  } while (lastResponseLength === limit);

  return users;
};

const getUsers = async (queryClient: QueryClient) => {
  const users = await getAllUsers();

  const avatars = await Promise.allSettled(getAvatarPromises(users, queryClient)).then((results) =>
    results.map((response) => {
      if (response.status === 'fulfilled' && response?.value !== '') {
        const base64 = btoa(
          // @ts-ignore
          new Uint8Array(response.value.data).reduce((respData, byte) => respData + String.fromCharCode(byte), ''),
        );
        return `data:;base64,${base64}`;
      }
      return '';
    }),
  );

  return users.map((newUser: User, i: number) => ({ ...newUser, avatar: avatars[i] })) as User[];
};

export const useGetUsers = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useQuery(['users'], () => getUsers(queryClient), {
    staleTime: 30 * 1000,
    onError: (e: AxiosError) => {
      if (!toast.isActive('users-fetching-error'))
        toast({
          id: 'users-fetching-error',
          title: t('common.error'),
          description: t('crud.error_fetching_obj', {
            obj: t('users.title'),
            e: e?.response?.data?.ErrorDescription,
          }),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
    },
  });
};

export const useGetUser = ({ id, enabled }: { id: string; enabled: boolean }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(
    ['users', id],
    () => axiosSec.get(`user/${id}?withExtendedInfo=true`).then(({ data }) => data as User),
    {
      enabled,
      onError: (e: AxiosError) => {
        if (!toast.isActive('user-fetching-error'))
          toast({
            id: 'user-fetching-error',
            title: t('common.error'),
            description: t('crud.error_fetching_obj', {
              obj: t('users.one'),
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

export const useSendUserEmailValidation = ({ id, refresh }: { id: string; refresh: () => void }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(() => axiosSec.put(`user/${id}?email_verification=true`, {}), {
    onSuccess: () => {
      toast({
        id: `user-validation-email-success`,
        title: t('common.success'),
        description: t('users.success_sending_validation'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      refresh();
    },
    onError: (e: AxiosError) => {
      toast({
        id: `user-validation-email-error`,
        title: t('common.error'),
        description: t('users.error_sending_validation', {
          e: e?.response?.data?.ErrorDescription,
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });
};
export const useSuspendUser = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  return useMutation(
    (isSuspended: boolean) =>
      axiosSec.put(`user/${id}`, {
        suspended: isSuspended,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
      },
    },
  );
};

export const useResetMfa = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  return useMutation(() => axiosSec.put(`user/${id}?resetMFA=true`, {}), {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useResetPassword = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  return useMutation(() => axiosSec.put(`user/${id}?forgotPassword=true`, {}), {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

const deleteUser = async (userId: string) => axiosSec.delete(`/user/${userId}`);
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

const createUser = async (newUser: {
  name: string;
  description?: string;
  email: string;
  currentPassword: string;
  notes?: { note: string }[];
  userRole: string;
  emailValidation: boolean;
  changePassword: boolean;
}) => axiosSec.post(`user/0${newUser.emailValidation ? '?email_verification=true' : ''}`, newUser);
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

const modifyUser = async (newUser: AtLeast<User, 'id'>) => axiosSec.put(`user/${newUser.id}`, newUser);
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(modifyUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

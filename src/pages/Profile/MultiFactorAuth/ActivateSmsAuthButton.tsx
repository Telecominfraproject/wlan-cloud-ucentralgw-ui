import * as React from 'react';
import { Button, IconButton, Text, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Pen } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import AddPhoneNumberModal from './AddPhoneNumberModal';
import { useAuth } from 'contexts/AuthProvider';
import { useUpdateAccount } from 'hooks/Network/Account';

type Props = {
  currentMfaMethod?: string;
  phoneNumber: () => string | undefined;
};
const ActivateSmsAuthButton = ({ currentMfaMethod, phoneNumber }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const updateUser = useUpdateAccount({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  const activate = async (phone: string) => {
    await updateUser.mutateAsync({
      id: user?.id,
      userTypeProprietaryInfo: {
        mfa: {
          enabled: true,
          method: 'sms',
        },
        mobiles: [{ number: phone }],
      },
    });
  };

  const deactivate = async () => {
    await updateUser.mutateAsync({
      id: user?.id,
      userTypeProprietaryInfo: {
        mfa: {
          enabled: false,
          method: '',
        },
      },
    });
  };

  return (
    <>
      {currentMfaMethod === 'sms' && (
        <>
          <Text textColor="gray.400" mr={2}>
            {phoneNumber()}
          </Text>
          <Tooltip label={t('common.edit')} hasArrow>
            <IconButton aria-label={t('common.edit')} size="sm" onClick={onOpen} icon={<Pen size={20} />} mr={2} />
          </Tooltip>
        </>
      )}
      {currentMfaMethod === 'sms' ? (
        <Button colorScheme="red" onClick={deactivate} isLoading={updateUser.isLoading}>
          {t('profile.deactivate')}
        </Button>
      ) : (
        <Button colorScheme="gray" variant="outline" onClick={onOpen}>
          {t('profile.activate')}
        </Button>
      )}
      <AddPhoneNumberModal isOpen={isOpen} onClose={onClose} onSuccess={activate} />
    </>
  );
};

export default ActivateSmsAuthButton;

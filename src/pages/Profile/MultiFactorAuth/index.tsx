import * as React from 'react';
import { Divider, Flex, Heading, Spacer, Tag, Text, VStack } from '@chakra-ui/react';
import { parsePhoneNumber } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import ActivateEmailMfaButton from './ActivateEmailMfaButton';
import ActivateGoogleAuthenticatorButton from './ActivateGoogleAuthenticatorButton';
import ActivateSmsAuthButton from './ActivateSmsAuthButton';
import DeactivateMfaButton from './DeactivateMfaButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useAuth } from 'contexts/AuthProvider';

const MultiFactorAuthProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const currentMfaMethod = React.useMemo(() => {
    if (!user) return undefined;

    const mfa = user.userTypeProprietaryInfo.mfa.enabled ? user.userTypeProprietaryInfo.mfa.method : undefined;

    return mfa;
  }, [user]);

  const phoneNumber = () => {
    if (!user) return undefined;

    const phone = user.userTypeProprietaryInfo.mobiles?.[0]?.number;
    if (phone) {
      try {
        const newPhone = parsePhoneNumber(phone);

        return newPhone.formatInternational();
      } catch {
        return phone;
      }
    }

    return phone;
  };

  return (
    <Card p={4}>
      <CardHeader mb={2}>
        <Heading size="md">{t('account.mfa')}</Heading>
        <Tag colorScheme={currentMfaMethod ? 'green' : 'red'} fontSize="lg" fontWeight="bold" ml={2}>
          {currentMfaMethod ? t('profile.enabled').toUpperCase() : t('profile.disabled').toUpperCase()}
        </Tag>
      </CardHeader>
      <CardBody display="block">
        <VStack spacing={4} divider={<Divider />} mt={4}>
          <Flex w="100%" alignItems="center" justifyContent="center" h="40px">
            <Heading size="sm">Authenticator App</Heading>
            <Spacer />
            <Text textColor="gray.400" mr={2}>
              Recommended
            </Text>
            {currentMfaMethod === 'authenticator' ? <DeactivateMfaButton /> : <ActivateGoogleAuthenticatorButton />}
          </Flex>
          <Flex w="100%" alignItems="center" justifyContent="center" h="40px">
            <Heading size="sm">Email</Heading>
            <Spacer />
            {currentMfaMethod === 'email' ? <DeactivateMfaButton /> : <ActivateEmailMfaButton />}
          </Flex>
          <Flex w="100%" alignItems="center" justifyContent="center" h="40px">
            <Heading size="sm">SMS</Heading>
            <Spacer />
            <ActivateSmsAuthButton currentMfaMethod={currentMfaMethod} phoneNumber={phoneNumber} />
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default MultiFactorAuthProfile;

import React, { useState } from 'react';
import { Box, Center, Flex, useColorMode, useColorModeValue, Image } from '@chakra-ui/react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoginForm } from './LoginForm';
import { MfaForm } from './MfaForm';
import { LoginFormProps } from 'models/Login';

interface LoginPageProps {
  lightLogo: string;
  darkLogo: string;
}

const LoginPage = ({ lightLogo, darkLogo }: LoginPageProps) => {
  const [activeForm, setActiveForm] = useState<LoginFormProps>({ form: 'login' });
  const { colorMode } = useColorMode();
  const loginBg = useColorModeValue('gray.100', 'gray.700');

  const getForm = React.useCallback(() => {
    if (activeForm.form === 'login') return <LoginForm setActiveForm={setActiveForm} />;
    if (activeForm.form === 'change-password' && activeForm.data?.userId && activeForm.data?.password)
      return <ChangePasswordForm activeForm={activeForm} setActiveForm={setActiveForm} />;
    if (activeForm.form === 'forgot-password') return <ForgotPasswordForm setActiveForm={setActiveForm} />;
    if (activeForm.form === 'mfa') return <MfaForm activeForm={activeForm} setActiveForm={setActiveForm} />;
    return null;
  }, [activeForm.form]);

  return (
    <Box px="5%" h="100vh" display="flex" alignItems="center">
      <Center display="block" w="100%">
        <Center h="100%" w="100%" mb={6} alignItems="center">
          <Image maxH="300px" w="100%" maxW="600px" src={colorMode === 'light' ? lightLogo : darkLogo} />
        </Center>
        <Center>
          <Flex
            borderRadius="40px"
            w="100%"
            maxW="600px"
            bgColor={loginBg}
            p="48px"
            boxShadow={colorMode === 'light' ? 'xl' : 'dark-lg'}
            direction="column"
          >
            {getForm()}
          </Flex>
        </Center>
      </Center>
    </Box>
  );
};

export default LoginPage;

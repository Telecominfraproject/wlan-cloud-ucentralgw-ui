import * as React from 'react';
import { Center, Flex, Spinner } from '@chakra-ui/react';
import ProfileLayout from './Layout';
import { useAuth } from 'contexts/AuthProvider';

const ProfilePage = () => {
  const { isUserLoaded } = useAuth();

  return (
    <Flex flexDirection="column" pt="75px">
      {!isUserLoaded ? (
        <Center mt={40}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <ProfileLayout />
      )}
    </Flex>
  );
};

export default ProfilePage;

import React from 'react';
import { Flex } from '@chakra-ui/react';
import UserTable from './Table';
import { useAuth } from 'contexts/AuthProvider';

const UsersPage = () => {
  const { isUserLoaded } = useAuth();

  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded && <UserTable />}
    </Flex>
  );
};

export default UsersPage;

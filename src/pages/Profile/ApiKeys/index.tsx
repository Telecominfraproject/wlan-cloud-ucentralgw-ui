import * as React from 'react';
import { Box } from '@chakra-ui/react';
import ApiKeyTable from './Table';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { useAuth } from 'contexts/AuthProvider';

const ApiKeysCard = () => {
  const { user } = useAuth();

  return (
    <Card p={4}>
      <CardBody>
        <Box w="100%">
          <ApiKeyTable userId={user?.id ?? ''} />
        </Box>
      </CardBody>
    </Card>
  );
};

export default ApiKeysCard;

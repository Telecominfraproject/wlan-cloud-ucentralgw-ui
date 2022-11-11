import * as React from 'react';
import ApiKeyTable from './Table';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { useAuth } from 'contexts/AuthProvider';

const ApiKeysCard = () => {
  const { user } = useAuth();

  return (
    <Card p={4}>
      <CardBody>
        <ApiKeyTable userId={user?.id ?? ''} />
      </CardBody>
    </Card>
  );
};

export default ApiKeysCard;

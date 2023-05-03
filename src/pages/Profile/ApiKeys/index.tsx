import * as React from 'react';
import ApiKeyTable from './Table';
import { Card } from 'components/Containers/Card';
import { useAuth } from 'contexts/AuthProvider';

const ApiKeysCard = () => {
  const { user } = useAuth();

  return (
    <Card>
      <ApiKeyTable userId={user?.id ?? ''} />
    </Card>
  );
};

export default ApiKeysCard;

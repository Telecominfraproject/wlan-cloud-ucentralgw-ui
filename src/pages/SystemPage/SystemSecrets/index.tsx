import * as React from 'react';
import {
  BackgroundProps,
  Box,
  EffectProps,
  Heading,
  InteractivityProps,
  LayoutProps,
  PositionProps,
  SpaceProps,
  Spacer,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SystemSecretCreateButton from './CreateButton';
import SystemSecretsTable from './Table';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useAuth } from 'contexts/AuthProvider';

export interface SystemSecretsCardProps
  extends LayoutProps,
    SpaceProps,
    BackgroundProps,
    InteractivityProps,
    PositionProps,
    EffectProps {}

export const SystemSecretsCard = ({ ...props }: SystemSecretsCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user || user.userRole !== 'root') {
    return null;
  }

  return (
    <Box px={4} py={4}>
      <Card variant="widget" {...props}>
        <CardHeader>
          <Heading size="md" my="auto">
            {t('system.secrets')}
          </Heading>
          <Spacer />
          <SystemSecretCreateButton />
        </CardHeader>
        <CardBody p={4}>
          <SystemSecretsTable />
        </CardBody>
      </Card>
    </Box>
  );
};

import React from 'react';
import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { ProviderWebSocketVenueUpdateResponse } from 'contexts/ProvisioningSocketProvider/utils';

interface Props {
  notification: ProviderWebSocketVenueUpdateResponse;
}

const ConfigurationPushesNotificationContent = ({ notification }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <Heading size="sm">
        {t('configurations.successful_pushes', {
          count: notification?.content?.success?.length ?? 0,
        })}
      </Heading>
      {notification?.content?.success && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList>
            {notification?.content?.success.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
      <Heading size="sm" mt={4}>
        {t('configurations.warning_pushes', { count: notification?.content?.warning?.length ?? 0 })}
      </Heading>
      {notification?.content?.warning && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList maxH="200px" overflowY="auto">
            {notification?.content?.warning.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
      <Heading size="sm" mt={4}>
        {t('configurations.error_pushes', { count: notification?.content?.error?.length ?? 0 })}
      </Heading>
      {notification?.content?.error && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList maxH="200px" overflowY="auto">
            {notification?.content?.error.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
    </>
  );
};

export default ConfigurationPushesNotificationContent;

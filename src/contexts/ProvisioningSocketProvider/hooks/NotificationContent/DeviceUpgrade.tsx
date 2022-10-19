import React from 'react';
import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { ProviderWebSocketVenueUpdateResponse } from 'contexts/ProvisioningSocketProvider/utils';

interface Props {
  notification: ProviderWebSocketVenueUpdateResponse;
}

const DeviceUpgradeNotificationContent = ({ notification }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <Heading size="sm">
        {t('inventory.successful_upgrades', {
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
        {t('inventory.not_connected', { count: notification?.content?.notConnected?.length ?? 0 })}
      </Heading>
      {notification?.content?.notConnected && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList maxH="200px" overflowY="auto">
            {notification?.content?.notConnected.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
      <Heading size="sm" mt={4}>
        {t('inventory.no_firmware', { count: notification?.content?.noFirmware?.length ?? 0 })}
      </Heading>
      {notification?.content?.noFirmware && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList maxH="200px" overflowY="auto">
            {notification?.content?.noFirmware.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
      <Heading size="sm" mt={4}>
        {t('inventory.skipped_upgrades', { count: notification?.content?.skipped?.length ?? 0 })}
      </Heading>
      {notification?.content?.skipped && (
        <Box maxH="200px" overflowY="auto">
          <UnorderedList maxH="200px" overflowY="auto">
            {notification?.content?.skipped.map((serialNumber) => (
              <ListItem key={uuid()}>{serialNumber}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
    </>
  );
};

export default DeviceUpgradeNotificationContent;

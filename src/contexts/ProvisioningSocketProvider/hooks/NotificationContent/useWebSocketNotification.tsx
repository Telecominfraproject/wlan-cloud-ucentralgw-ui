import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useToast,
  CloseButton as ChakraCloseButton,
  VStack,
  ModalHeader,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { StringMap, TOptions } from 'i18next';
import { X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { ProviderWebSocketVenueUpdateResponse } from '../../utils';
import NotificationContent from '.';

const getStatusFromNotification = (notification: ProviderWebSocketVenueUpdateResponse) => {
  let status: 'success' | 'warning' | 'error' = 'success';
  if (notification.content.warning?.length > 0) status = 'warning';
  if (notification.content.error?.length > 0) status = 'error';

  return status;
};

const getNotificationDescription = (
  t: (key: string, options?: string | TOptions<StringMap> | undefined) => string,
  notification: ProviderWebSocketVenueUpdateResponse,
) => {
  if (
    notification.content.type === 'venue_configuration_update' ||
    notification.content.type === 'entity_configuration_update' ||
    notification.content.type === 'venue_rebooter' ||
    notification.content.type === 'venue_upgrader'
  ) {
    return t('configurations.notification_details', {
      success: notification.content.success?.length ?? 0,
      warning: notification.content.warning?.length ?? 0,
      error: notification.content.error?.length ?? 0,
    });
  }
  return notification.content.details;
};

const useWebSocketNotification = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notif, setNotif] = useState<ProviderWebSocketVenueUpdateResponse | undefined>(undefined);
  const toast = useToast();

  const openDetails = useCallback((newObj: ProviderWebSocketVenueUpdateResponse, closeToast?: () => void) => {
    setNotif(newObj);
    if (closeToast) closeToast();
    onOpen();
  }, []);

  const pushNotification = useCallback((notification: ProviderWebSocketVenueUpdateResponse) => {
    toast({
      id: uuid(),
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      render: ({ onClose: closeToast }) => (
        <Alert variant="solid" status={getStatusFromNotification(notification)}>
          <AlertIcon />
          <VStack spacing={1} align="stretch">
            <AlertTitle>{notification.content.title}</AlertTitle>
            <AlertDescription>{getNotificationDescription(t, notification)}</AlertDescription>
            <Button size="sm" colorScheme="blue" onClick={() => openDetails(notification, closeToast)}>
              {t('common.view_details')}
            </Button>
          </VStack>
          <ChakraCloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={closeToast} />
        </Alert>
      ),
    });
  }, []);

  const modal = useMemo(
    () => (
      <Modal onClose={onClose} isOpen={isOpen} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxWidth={{ sm: '90%', md: '900px', lg: '1000px', xl: '80%' }}>
          <ModalHeader>
            <Flex justifyContent="center" alignItems="center" maxW="100%" px={1}>
              {notif?.content?.title ?? ''}
              <Spacer />
              <Tooltip label={t('common.close')}>
                <IconButton aria-label="close" colorScheme="gray" onClick={onClose} icon={<X size={20} />} />
              </Tooltip>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <NotificationContent notification={notif} />
          </ModalBody>
        </ModalContent>
      </Modal>
    ),
    [notif, isOpen],
  );

  const toReturn = useMemo(
    () => ({
      modal,
      pushNotification,
    }),
    [modal],
  );

  return toReturn;
};

export default useWebSocketNotification;

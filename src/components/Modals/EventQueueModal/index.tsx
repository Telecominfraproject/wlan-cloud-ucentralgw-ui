import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Spinner,
  useClipboard,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { RefreshButton } from '../../Buttons/RefreshButton';
import { Modal } from '../Modal';
import { useGetEventQueue } from 'hooks/Network/Commands';

export type EventQueueModalProps = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

export const EventQueueModal = ({ serialNumber, modalProps }: EventQueueModalProps) => {
  const { t } = useTranslation();
  const eventQueue = useGetEventQueue();
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(eventQueue.data ?? {}, null, 2));

  const fetch = () => {
    eventQueue.mutate(serialNumber);
  };

  React.useEffect(() => {
    if (modalProps.isOpen) fetch();
  }, [modalProps.isOpen]);

  return (
    <Modal
      {...modalProps}
      title={t('controller.queue.title')}
      topRightButtons={
        <>
          <Button onClick={onCopy} size="md" colorScheme="teal">
            {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
          </Button>
          <RefreshButton onClick={fetch} isCompact isFetching={eventQueue.isLoading} />
        </>
      }
    >
      <>
        {eventQueue.isLoading && (
          <Center my="100px">
            <Spinner size="xl" />
          </Center>
        )}
        {eventQueue.error && (
          <Alert status="error" my="100px">
            <AlertIcon />
            <Box>
              <AlertTitle>{t('common.error')}</AlertTitle>
              {
                // @ts-ignore
                <AlertDescription>{eventQueue.error?.response?.data?.ErrorDescription}</AlertDescription>
              }
            </Box>
          </Alert>
        )}
        {eventQueue.data && (
          <Accordion defaultIndex={0} allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {t('controller.devices.results')}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <pre>{JSON.stringify(eventQueue.data?.results, null, 2)}</pre>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {t('controller.devices.complete_data')}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <pre>{JSON.stringify(eventQueue.data, null, 2)}</pre>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </>
    </Modal>
  );
};

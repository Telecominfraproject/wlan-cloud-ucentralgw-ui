import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  IconButton,
  Spinner,
  Tooltip,
  useClipboard,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { ClockCounterClockwise } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useGetDeviceLastStats } from 'hooks/Network/Statistics';
import { Modal } from 'components/Modals/Modal';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { LoadingOverlay } from 'components/LoadingOverlay';
import { JsonViewer } from '@textea/json-viewer';

type Props = {
  serialNumber: string;
};

const ViewLastStatsModal = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getLastStats = useGetDeviceLastStats({ serialNumber });
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(getLastStats.data ?? {}, null, 2));
  const { colorMode } = useColorMode();

  return (
    <>
      <Tooltip label={t('statistics.last_stats')}>
        <IconButton
          aria-label={t('statistics.last_stats')}
          onClick={onOpen}
          colorScheme="purple"
          icon={<ClockCounterClockwise size={20} />}
        />
      </Tooltip>
      <Modal
        isOpen={isOpen}
        title={t('statistics.last_stats')}
        topRightButtons={
          <>
            <Button onClick={onCopy} size="md" colorScheme="teal">
              {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
            </Button>
            <RefreshButton
              isCompact
              onClick={getLastStats.refetch}
              isFetching={getLastStats.isFetching}
              // @ts-ignore
              colorScheme="blue"
            />
          </>
        }
        onClose={onClose}
      >
        <Box display="inline-block" w="100%">
          {!getLastStats.data && getLastStats.isFetching && (
            <Center my="100px">
              <Spinner />
            </Center>
          )}
          {getLastStats.data && (
            <LoadingOverlay isLoading={getLastStats.isFetching}>
              <Accordion defaultIndex={0} allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {t('common.preview')}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <JsonViewer
                      rootName={false}
                      displayDataTypes={false}
                      enableClipboard={false}
                      theme={colorMode === 'light' ? undefined : 'dark'}
                      defaultInspectDepth={1}
                      value={getLastStats.data as object}
                      style={{ background: 'unset', display: 'unset' }}
                    />
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {t('analytics.raw_data')}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <pre>{JSON.stringify(getLastStats.data, null, 2)}</pre>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </LoadingOverlay>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ViewLastStatsModal;

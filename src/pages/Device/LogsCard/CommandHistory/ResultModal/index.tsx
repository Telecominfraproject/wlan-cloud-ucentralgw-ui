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
  Center,
  Code,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from '@chakra-ui/react';
import { JsonViewer } from '@textea/json-viewer';
import { useTranslation } from 'react-i18next';
import DownloadScriptButton from './DownloadScriptButton';
import DownloadTraceButton from './DownloadTraceButton';
import DownloadWifiScanButton from './DownloadWifiScanButton';
import { Modal } from 'components/Modals/Modal';
import WifiScanResultDisplay from 'components/Modals/WifiScanModal/ResultDisplay';
import { compactDate } from 'helpers/dateFormatting';
import { uppercaseFirstLetter } from 'helpers/stringHelper';
import { DeviceCommandHistory } from 'hooks/Network/Commands';
import { WifiScanResult } from 'models/Device';

type Props = {
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
  command?: DeviceCommandHistory;
};

const CommandResultModal = ({ modalProps, command }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  if (!command) return null;

  const results = () => {
    if (command.status === 'failed') {
      return (
        <Center my="50px">
          <Alert w="unset" status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>{uppercaseFirstLetter(command.status)}</AlertTitle>
              <AlertDescription>{command.errorText}</AlertDescription>
            </Box>
          </Alert>
        </Center>
      );
    }
    if (command.command === 'wifiscan') {
      return <WifiScanResultDisplay results={command as unknown as WifiScanResult} setCsvData={() => {}} />;
    }
    // If it's a non-deferred script
    if (
      command.command === 'script' &&
      (command.details?.uri === undefined || command.details?.uri === '') &&
      command.status === 'completed'
    ) {
      return (
        <Code whiteSpace="pre-line">{command.results?.status?.result ?? JSON.stringify(command.results, null, 2)}</Code>
      );
    }
    return (
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
              value={command.results?.status as object}
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
          <AccordionPanel pb={4} overflowX="auto" overflowY="auto" maxH="500px">
            <pre>{JSON.stringify(command.results?.status, null, 2)}</pre>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <Modal
      isOpen={modalProps.isOpen}
      onClose={modalProps.onClose}
      title={`${uppercaseFirstLetter(command.command)} - ${compactDate(command.submitted)} `}
      topRightButtons={
        <>
          <DownloadWifiScanButton command={command as unknown as WifiScanResult} />
          <DownloadTraceButton command={command} />
          <DownloadScriptButton command={command} />
        </>
      }
    >
      <Tabs variant="enclosed" w="100%">
        <TabList>
          <Tab>{t('controller.devices.results')}</Tab>
          <Tab>{t('controller.devices.complete_data')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{results()}</TabPanel>
          <TabPanel>
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
                    value={command as object}
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
                <AccordionPanel pb={4} overflowX="auto" overflowY="auto" maxH="500px">
                  <pre>{JSON.stringify(command, null, 2)}</pre>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Modal>
  );
};

export default CommandResultModal;

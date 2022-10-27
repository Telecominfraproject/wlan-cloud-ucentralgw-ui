import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from '@chakra-ui/react';
import { JsonViewer } from '@textea/json-viewer';
import { Download } from 'phosphor-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { Modal } from 'components/Modals/Modal';
import WifiScanResultDisplay from 'components/Modals/WifiScanModal/ResultDisplay';
import { compactDate, dateForFilename } from 'helpers/dateFormatting';
import { uppercaseFirstLetter } from 'helpers/stringHelper';
import { DeviceCommandHistory } from 'hooks/Network/Commands';
import { useDownloadTrace } from 'hooks/Network/Trace';
import { DeviceScanResult } from 'models/Device';

type Props = {
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
  command?: DeviceCommandHistory;
};

const CommandDetailsModal = ({ modalProps, command }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const download = useDownloadTrace({ serialNumber: command?.serialNumber ?? '', commandId: command?.UUID ?? '' });
  const [csvData, setCsvData] = React.useState<DeviceScanResult[] | undefined>(undefined);

  if (!command) return null;

  return (
    <Modal
      isOpen={modalProps.isOpen}
      onClose={modalProps.onClose}
      title={`${uppercaseFirstLetter(command.command)} - ${compactDate(command.completed)} `}
      topRightButtons={
        <>
          {csvData ? (
            <CSVLink
              filename={`wifi_scan_${command.serialNumber}_${dateForFilename(new Date().getTime() / 1000)}.csv`}
              data={csvData as object[]}
            >
              <ResponsiveButton
                color="gray"
                icon={<Download size={20} />}
                isCompact
                label={t('common.download')}
                onClick={() => {}}
              />
            </CSVLink>
          ) : undefined}
          {command?.command === 'trace' && (
            <ResponsiveButton
              color="gray"
              icon={<Download size={20} />}
              isCompact
              label={t('common.download')}
              isLoading={download.isFetching}
              onClick={download.refetch}
            />
          )}
        </>
      }
    >
      <Tabs variant="enclosed" w="100%">
        <TabList>
          <Tab>{t('controller.devices.results')}</Tab>
          <Tab>{t('controller.devices.complete_data')}</Tab>
        </TabList>
        <TabPanels>
          {command.command === 'wifiscan' ? (
            <TabPanel>
              {
                // @ts-ignore
                <WifiScanResultDisplay results={command as WifiScanResult} setCsvData={setCsvData} />
              }
            </TabPanel>
          ) : (
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
                  <AccordionPanel pb={4}>
                    <pre>{JSON.stringify(command.results?.status, null, 2)}</pre>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </TabPanel>
          )}
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
                <AccordionPanel pb={4}>
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

export default CommandDetailsModal;

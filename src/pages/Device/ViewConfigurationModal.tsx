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
import { JsonViewer } from '@textea/json-viewer';
import { Barcode, DownloadSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'components/Modals/Modal';
import { useGetDevice } from 'hooks/Network/Devices';
import { RefreshButton } from 'components/Buttons/RefreshButton';

const ViewConfigurationModal = ({ serialNumber }: { serialNumber: string }) => {
  const { t } = useTranslation();
  const getDevice = useGetDevice({ serialNumber });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasCopied, onCopy, setValue } = useClipboard(JSON.stringify(getDevice.data?.configuration ?? {}, null, 2));
  const { colorMode } = useColorMode();

  React.useEffect(() => {
    if (getDevice.data) {
      setValue(JSON.stringify(getDevice.data.configuration, null, 2));
    }
  }, [getDevice.data?.configuration]);

  const handleDownload = () => {
    const jsonString = JSON.stringify(getDevice.data?.configuration ?? {}, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNumber}-configuration.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenClick = () => {
    getDevice.refetch();
    onOpen();
  };

  return (
    <>
      <Tooltip label={t('configurations.one')} hasArrow>
        <IconButton
          aria-label={t('configurations.one')}
          icon={<Barcode size={20} />}
          onClick={handleOpenClick}
          colorScheme="purple"
        />
      </Tooltip>
      <Modal
        isOpen={isOpen}
        title={t('configurations.one')}
        topRightButtons={
          <>
            <Button onClick={onCopy} size="md" colorScheme="teal">
              {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
            </Button>
            <Tooltip label={t('common.download')} hasArrow>
              <IconButton
                aria-label={t('common.download')}
                icon={<DownloadSimple size={20} />}
                onClick={handleDownload}
                colorScheme="blue"
              />
            </Tooltip>
            <RefreshButton onClick={getDevice.refetch} isFetching={getDevice.isFetching} />
          </>
        }
        onClose={onClose}
      >
        <Box display="inline-block" w="100%">
          {getDevice.data && !getDevice.isFetching ? (
            <Box maxH="calc(100vh - 250px)" minH="300px" overflowY="auto">
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
                      value={getDevice.data.configuration as object}
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
                  <AccordionPanel pb={4} overflowX="auto">
                    <pre>{JSON.stringify(getDevice.data.configuration, null, 2)}</pre>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          ) : (
            <Center my={12}>
              <Spinner size="xl" />
            </Center>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(ViewConfigurationModal);

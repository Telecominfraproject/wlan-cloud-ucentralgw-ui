import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  IconButton,
  Tooltip,
  useClipboard,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { JsonViewer } from '@textea/json-viewer';
import { Barcode } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'components/Modals/Modal';
import { DeviceConfiguration } from 'models/Device';

const ViewConfigurationModal = ({ configuration }: { configuration?: DeviceConfiguration }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasCopied, onCopy, setValue } = useClipboard(JSON.stringify(configuration ?? {}, null, 2));
  const { colorMode } = useColorMode();

  React.useEffect(() => {
    if (configuration) {
      setValue(JSON.stringify(configuration, null, 2));
    }
  }, [configuration]);

  return (
    <>
      <Tooltip label={t('configurations.one')} hasArrow>
        <IconButton
          aria-label={t('configurations.one')}
          icon={<Barcode size={20} />}
          onClick={onOpen}
          colorScheme="purple"
        />
      </Tooltip>
      <Modal
        isOpen={isOpen}
        title={t('configurations.one')}
        topRightButtons={
          <Button onClick={onCopy} size="md" colorScheme="teal">
            {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
          </Button>
        }
        onClose={onClose}
      >
        <Box display="inline-block" w="100%">
          {configuration && (
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
                      value={configuration as object}
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
                    <pre>{JSON.stringify(configuration, null, 2)}</pre>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ViewConfigurationModal;

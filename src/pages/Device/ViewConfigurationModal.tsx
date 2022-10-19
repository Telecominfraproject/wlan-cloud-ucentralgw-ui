import * as React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  useClipboard,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { JsonViewer } from '@textea/json-viewer';
import { Modal } from 'components/Modals/Modal';
import { DeviceConfiguration } from 'models/Device';

const ViewConfigurationModal = ({ configuration }: { configuration?: DeviceConfiguration }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(configuration ?? {}, null, 2));
  const { colorMode } = useColorMode();

  return (
    <>
      <Button onClick={onOpen} isDisabled={!configuration} colorScheme="purple">
        {t('configurations.one')}
      </Button>
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
                <AccordionPanel pb={4}>
                  <pre>{JSON.stringify(configuration, null, 2)}</pre>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ViewConfigurationModal;

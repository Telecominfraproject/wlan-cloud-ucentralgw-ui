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
  Heading,
  Spinner,
  useClipboard,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { JsonViewer } from '@textea/json-viewer';
import { useGetDeviceCapabilities } from 'hooks/Network/Devices';
import { Modal } from 'components/Modals/Modal';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { LoadingOverlay } from 'components/LoadingOverlay';
import FormattedDate from 'components/InformationDisplays/FormattedDate';

type Props = {
  serialNumber: string;
};

const ViewCapabilitiesModal = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getCapabilities = useGetDeviceCapabilities({ serialNumber });
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(getCapabilities.data?.capabilities ?? {}, null, 2));
  const { colorMode } = useColorMode();

  return (
    <>
      <Button onClick={onOpen} colorScheme="pink" mr={2}>
        {t('controller.devices.capabilities')}
      </Button>
      <Modal
        isOpen={isOpen}
        title={t('controller.devices.capabilities')}
        topRightButtons={
          <>
            <Button onClick={onCopy} size="md" colorScheme="teal">
              {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
            </Button>
            <RefreshButton
              isCompact
              onClick={getCapabilities.refetch}
              isFetching={getCapabilities.isFetching}
              colorScheme="blue"
            />
          </>
        }
        onClose={onClose}
      >
        <Box display="inline-block" w="100%">
          {!getCapabilities.data && getCapabilities.isFetching && (
            <Center my="100px">
              <Spinner />
            </Center>
          )}
          {getCapabilities.data && (
            <LoadingOverlay isLoading={getCapabilities.isFetching}>
              <Heading size="sm" mb={2}>
                {t('controller.devices.last_modified')}: <FormattedDate date={getCapabilities.data.lastUpdate} />
              </Heading>
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
                      value={getCapabilities.data.capabilities as object}
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
                    <pre>{JSON.stringify(getCapabilities.data.capabilities, null, 2)}</pre>
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

export default ViewCapabilitiesModal;

import * as React from 'react';
import { Box, Button, Center, HStack, Heading, IconButton, Progress, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Download, Export } from '@phosphor-icons/react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { ExportedDeviceInfo, getAllExportedDevicesInfo, getSelectExportedDevicesInfo } from './utils';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { Modal } from 'components/Modals/Modal';
import { dateForFilename } from 'helpers/dateFormatting';

const HEADER_MAPPING: { key: keyof ExportedDeviceInfo; label: string }[] = [
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'connected', label: 'Connected' },
  { key: 'firmware', label: 'Firmware' },
  { key: 'memory', label: 'Memory (%)' },
  { key: 'load', label: 'Load (%)' },
  { key: 'temperature', label: 'Temperature (°C)' },
  { key: 'sanity', label: 'Sanity (%)' },
  { key: 'revision', label: 'Revision' },
  { key: 'ip', label: 'IP Address' },
  { key: 'provisioning', label: 'Provisioning' },
  { key: 'radiusSessions', label: 'Radius Sessions' },
  { key: 'uptime', label: 'Uptime (s)' },
  { key: 'lastContact', label: 'Last Contact (UTC)' },
  { key: 'lastUpgrade', label: 'Last Upgrade (UTC)' },
  { key: 'rx', label: 'RX (MB)' },
  { key: 'tx', label: 'TX (MB)' },
  { key: 'twoG', label: '2G Associations' },
  { key: 'fiveG', label: '5G Associations' },
  { key: 'sixG', label: '6G Associations' },
  { key: 'certificateExpiry', label: 'Certificate Expiry (UTC)' },
];
type Status = {
  progress: number;
  status: 'loading-all' | 'loading-select' | 'success' | 'error' | 'idle';
  error?: string;
  lastResults?: ExportedDeviceInfo[];
};

type Props = {
  currentPageSerialNumbers: string[];
};

const ExportDevicesTableButton = ({ currentPageSerialNumbers }: Props) => {
  const { t } = useTranslation();
  const modalProps = useDisclosure();
  const [status, setStatus] = React.useState<Status>({
    progress: 0,
    status: 'idle',
  });

  const setProgress = (progress: number) => {
    setStatus((prev) => ({ ...prev, progress }));
  };

  const handleAllClick = async () => {
    setStatus((prev) => ({ ...prev, error: undefined, lastResults: undefined, status: 'loading-all', progress: 0 }));
    getAllExportedDevicesInfo(setProgress)
      .then((result) => {
        setStatus((prev) => ({ ...prev, status: 'success', lastResults: result }));
      })
      .catch((error) => {
        setStatus((prev) => ({ ...prev, status: 'error', error }));
      });
  };
  const handleCurrentPageClick = async () => {
    setStatus((prev) => ({ ...prev, error: undefined, lastResults: undefined, status: 'loading-select', progress: 0 }));
    getSelectExportedDevicesInfo(currentPageSerialNumbers, setProgress)
      .then((result) => {
        setStatus((prev) => ({ ...prev, status: 'success', lastResults: result }));
      })
      .catch((error) => {
        setStatus((prev) => ({ ...prev, status: 'error', error }));
      });
  };

  const onOpen = () => {
    setStatus({ progress: 0, status: 'idle' });
    modalProps.onOpen();
  };

  return (
    <>
      <Tooltip label={t('common.export')}>
        <IconButton aria-label={t('common.export')} icon={<Export size={20} />} colorScheme="blue" onClick={onOpen} />
      </Tooltip>
      <Modal {...modalProps} title={t('common.export')}>
        <Box>
          <Center mb={8}>
            <HStack>
              <Button
                onClick={handleAllClick}
                colorScheme="gray"
                isDisabled={status.status.includes('loading')}
                isLoading={status.status === 'loading-all'}
              >
                {t('devices.all')} {t('devices.title')}
              </Button>
              <Button
                onClick={handleCurrentPageClick}
                colorScheme="gray"
                isDisabled={currentPageSerialNumbers.length === 0 || status.status.includes('loading')}
                isLoading={status.status === 'loading-select'}
              >
                {t('table.export_current_page')} ({currentPageSerialNumbers.length})
              </Button>
            </HStack>
          </Center>
          {status.status.includes('loading') || status.status === 'success' ? (
            <Box>
              <Center>
                <Heading size="sm">{Math.round(status.progress)}%</Heading>
              </Center>
              <Box px={8}>
                <Progress
                  isIndeterminate={status.progress === 0}
                  value={status.progress}
                  colorScheme={status.progress !== 100 ? 'blue' : 'green'}
                  hasStripe={status.progress !== 100}
                  isAnimated={status.progress !== 100}
                />
              </Box>
              <Center my={8} hidden={!status.lastResults}>
                <CSVLink
                  filename={`devices_export_${dateForFilename(new Date().getTime() / 1000)}.csv`}
                  data={status.lastResults ?? []}
                  headers={HEADER_MAPPING}
                >
                  <ResponsiveButton
                    color="blue"
                    icon={<Download size={20} />}
                    isCompact={false}
                    label={t('common.download')}
                    onClick={() => {}}
                  />
                </CSVLink>
              </Center>
            </Box>
          ) : null}
        </Box>
      </Modal>
    </>
  );
};

export default ExportDevicesTableButton;

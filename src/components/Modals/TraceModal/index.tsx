import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
} from '@chakra-ui/react';
import { ArrowLeft } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { useDownloadTrace, useTrace } from 'hooks/Network/Trace';

export type TraceModalProps = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

type FormValues = {
  type: 'duration' | 'packets';
  network: 'up' | 'down';
  waitForResponse: boolean;
  duration: string;
  packets: string;
};

export const TraceModal = ({ serialNumber, modalProps }: TraceModalProps) => {
  const { t } = useTranslation();
  const [form, setForm] = React.useState<FormValues>({
    type: 'duration',
    network: 'up',
    waitForResponse: true,
    duration: '20',
    packets: '100',
  });
  const traceDevice = useTrace({ serialNumber, alertOnCompletion: !form.waitForResponse });
  const download = useDownloadTrace({ serialNumber, commandId: traceDevice.data?.data.UUID ?? '' });

  const onFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const onToggleChange = (e: {
    target: {
      name: string;
      checked: boolean;
      value: string;
    };
  }) => {
    setForm({
      ...form,
      [e.target.name]: e.target.checked,
    });
  };

  const onStart = () => {
    traceDevice.mutate({
      serialNumber,
      type: form.type,
      network: form.network,
      waitForResponse: form.waitForResponse,
      // @ts-ignore
      duration: form.type === 'duration' ? parseInt(form.duration, 10) : undefined,
      packets: form.type === 'packets' ? parseInt(form.packets, 10) : undefined,
    });
    if (!form.waitForResponse) {
      modalProps.onClose();
    }
  };
  const onDownload = () => {
    download.refetch();
  };

  return (
    <Modal
      {...modalProps}
      title={t('controller.devices.trace')}
      options={{ modalSize: 'sm' }}
      topRightButtons={
        traceDevice.data ? (
          <Button rightIcon={<ArrowLeft />} onClick={traceDevice.reset}>
            {t('common.go_back')}
          </Button>
        ) : (
          <Button colorScheme="blue" onClick={onStart} isLoading={traceDevice.isLoading}>
            {t('common.start')}
          </Button>
        )
      }
    >
      <Box>
        {traceDevice.isLoading && (
          <Center my="100px">
            <Spinner size="xl" />
          </Center>
        )}
        {traceDevice.data && (
          <Center my="100px">
            <Button onClick={onDownload} colorScheme="blue" isLoading={download.isFetching}>
              {t('controller.trace.download')}
            </Button>
          </Center>
        )}
        {!traceDevice.isLoading && !traceDevice.data && !traceDevice.error && (
          <>
            <Center>
              <Alert status="info" w="unset">
                <AlertIcon />
                {t('controller.devices.trace_description')}
              </Alert>
            </Center>
            <SimpleGrid minChildWidth="140px" spacing={4} my={4}>
              <FormControl>
                <FormLabel>{t('common.type')}</FormLabel>
                <Select name="type" value={form.type} onChange={onFormChange} w="120px">
                  <option value="duration">{t('controller.trace.duration')}</option>
                  <option value="packets">{t('controller.trace.packets')}</option>
                </Select>
              </FormControl>
              {form.type === 'duration' ? (
                <FormControl>
                  <FormLabel>{t('controller.trace.duration')}</FormLabel>
                  <Select name="duration" value={form.duration} onChange={onFormChange} w="90px">
                    <option value="20">20s</option>
                    <option value="40">40s</option>
                    <option value="60">60s</option>
                    <option value="120">120s</option>
                  </Select>
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel>{t('controller.trace.packets')}</FormLabel>
                  <Select name="packets" value={form.packets} onChange={onFormChange} w="90px">
                    <option value="100">100</option>
                    <option value="250">250</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </Select>
                </FormControl>
              )}
              <FormControl>
                <FormLabel>{t('controller.trace.network')}</FormLabel>
                <Select name="network" value={form.network} onChange={onFormChange} w="90px">
                  <option value="up">{t('controller.trace.up')}</option>
                  <option value="down">{t('controller.trace.down')}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('controller.trace.wait')}</FormLabel>
                <Switch
                  mt={1}
                  size="lg"
                  name="waitForResponse"
                  isChecked={form.waitForResponse}
                  onChange={onToggleChange}
                />
              </FormControl>
            </SimpleGrid>
          </>
        )}
      </Box>
    </Modal>
  );
};

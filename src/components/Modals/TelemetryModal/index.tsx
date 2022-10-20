import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Checkbox,
  FormLabel,
  Heading,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Spinner,
  Stack,
  useClipboard,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { lowercaseFirstLetter } from 'helpers/stringHelper';
import { useTelemetry } from 'hooks/Network/Telemetry';

export type TelemetryModalProps = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

type FormData = {
  serialNumber: string;
  interval: number;
  lifetime: number;
  kafka: boolean;
  types: string[];
};

const _TelemetryModal = ({ serialNumber, modalProps }: TelemetryModalProps) => {
  const { t } = useTranslation();
  const [form, setForm] = React.useState<FormData>({
    serialNumber,
    interval: 3,
    lifetime: 60 * 5,
    kafka: false,
    types: ['wifi-frames', 'dhcp-snooping', 'state'],
  });
  const [lastDate, setLastDate] = React.useState<Date>(new Date());
  const telemetry = useTelemetry();
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(telemetry.lastMessage?.msg ?? {}, null, 2));

  const onStart = () => {
    telemetry.startTelemetry(form, modalProps.onClose);
  };

  const tick = () => {
    setLastDate(new Date());
  };

  const secondsAgo = React.useMemo(
    () =>
      telemetry.lastMessage?.timestamp
        ? Math.max(0, Math.floor((lastDate.getTime() - telemetry.lastMessage.timestamp.getTime()) / 1000))
        : ' X ',
    [lastDate, telemetry.lastMessage?.timestamp],
  );

  const onToggle = (value: string) => (e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      setForm({
        ...form,
        types: [...form.types, value],
      });
    } else {
      setForm({
        ...form,
        types: form.types.filter((type) => type !== value),
      });
    }
  };

  React.useEffect(() => {
    telemetry.closeSocket();
  }, [modalProps.isOpen]);

  React.useEffect(() => {
    const timerID = setTimeout(() => tick(), 1000);

    return () => {
      clearTimeout(timerID);
    };
  }, [lastDate]);
  React.useEffect(() => {
    setForm({
      ...form,
      serialNumber,
    });
  }, [serialNumber]);

  return (
    <Modal
      {...modalProps}
      title={t('controller.telemetry.title')}
      topRightButtons={
        <Button
          onClick={onStart}
          isDisabled={telemetry.isOpen || form.types.length === 0}
          isLoading={telemetry.startRequest.isLoading}
          colorScheme="blue"
        >
          {t('common.start')}
        </Button>
      }
    >
      <>
        {telemetry.startRequest.isLoading && (
          <Center my="100px">
            <Spinner size="xl" />
          </Center>
        )}
        {telemetry.startRequest.error && (
          <Alert status="error" my="100px">
            <AlertIcon />
            <Box>
              <AlertTitle>{t('common.error')}</AlertTitle>
              {
                // @ts-ignore
                <AlertDescription>{telemetry.error?.response?.data?.ErrorDescription}</AlertDescription>
              }
            </Box>
          </Alert>
        )}
        {telemetry.startRequest.data ? (
          <>
            <p>
              {t('controller.telemetry.interval')}: {form.interval} {lowercaseFirstLetter(t('common.seconds'))}
            </p>
            <p>
              {t('controller.telemetry.duration')}: {form.interval}{' '}
              {lowercaseFirstLetter(t('controller.telemetry.minutes'))}
            </p>
            <p>
              {t('controller.telemetry.types')}: {form.types.join(', ')}
            </p>
            <p>
              {t('controller.telemetry.last_update')}: {telemetry.lastMessage?.timestamp.toLocaleString()}
            </p>
            <Heading size="sm">{t('controller.telemetry.seconds_ago', { seconds: secondsAgo })}</Heading>
            <Box textAlign="right" mb={2}>
              <Button onClick={onCopy} size="md" colorScheme="teal">
                {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
              </Button>
            </Box>
            <Box maxH="400px" overflowY="auto">
              <pre>{JSON.stringify(telemetry.lastMessage?.msg ?? {}, null, 2)}</pre>
            </Box>
          </>
        ) : (
          <>
            <FormLabel>{t('controller.telemetry.interval')}</FormLabel>
            <Slider
              step={1}
              value={form.interval}
              max={120}
              onChange={(value) => setForm({ ...form, interval: value })}
              focusThumbOnChange={false}
            >
              <SliderMark
                value={form.interval}
                textAlign="center"
                bg="blue.500"
                color="white"
                ml="6"
                mt="-3"
                w="12"
                zIndex={2}
              >
                {form.interval}s
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <FormLabel mt={4}>{t('controller.telemetry.duration')}</FormLabel>
            <Slider
              step={1}
              value={form.lifetime / 60}
              max={120}
              onChange={(value) => setForm({ ...form, lifetime: value * 60 })}
              focusThumbOnChange={false}
            >
              <SliderMark
                value={form.lifetime / 60}
                textAlign="center"
                bg="blue.500"
                color="white"
                ml="6"
                mt="-3"
                w="12"
                zIndex={2}
              >
                {form.lifetime / 60}m
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <SimpleGrid minChildWidth="320px" spacing={2} mt={4}>
              <Box>
                <FormLabel>{t('controller.telemetry.output')}</FormLabel>
                <Select
                  value={form.kafka ? 'kafka' : ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      kafka: e.target.value === 'kafka',
                    })
                  }
                  w="160px"
                >
                  <option value="">{t('controller.telemetry.websocket')}</option>
                  <option value="kafka">{t('controller.telemetry.kafka')}</option>
                </Select>
              </Box>
              <Box>
                <FormLabel>{t('controller.telemetry.types')}</FormLabel>
                <Stack spacing={5} direction="row" mt={4}>
                  <Checkbox
                    colorScheme="blue"
                    isChecked={form.types.includes('wifi-frames')}
                    onChange={onToggle('wifi-frames')}
                  >
                    WiFi Frames
                  </Checkbox>
                  <Checkbox
                    colorScheme="green"
                    isChecked={form.types.includes('dhcp-snooping')}
                    onChange={onToggle('dhcp-snooping')}
                  >
                    DHCP Snooping
                  </Checkbox>
                  <Checkbox colorScheme="purple" isChecked={form.types.includes('state')} onChange={onToggle('state')}>
                    State
                  </Checkbox>
                </Stack>
              </Box>
            </SimpleGrid>
            {form.types.length === 0 && (
              <Center>
                <Alert status="error" mt={4} w="unset">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{t('common.error')}</AlertTitle>
                    <AlertDescription>{t('controller.telemetry.need_types')}</AlertDescription>
                  </Box>
                </Alert>
              </Center>
            )}
          </>
        )}
      </>
    </Modal>
  );
};

export const TelemetryModal = React.memo(_TelemetryModal);

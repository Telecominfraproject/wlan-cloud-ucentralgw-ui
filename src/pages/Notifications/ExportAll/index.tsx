import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  CircularProgress,
  CircularProgressLabel,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Play, Stop, Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import { useSecurityStore } from 'contexts/SecuritySocketProvider/useStore';
import { useFirmwareStore } from 'contexts/FirmwareSocketProvider/useStore';

type ExportFormat = 'json' | 'csv';

type LogEntry = {
  source: string;
  timestamp: string;
  type: string;
  level?: string;
  thread?: string;
  message: string;
  serialNumber?: string;
  rawData?: string;
};

const ExportAllLogsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [duration, setDuration] = React.useState<number>(1);
  const [format, setFormat] = React.useState<ExportFormat>('json');
  const [isCollecting, setIsCollecting] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0);
  const [startTime, setStartTime] = React.useState<Date | null>(null);

  const controllerLogs = useControllerStore((state) => state.allMessages);
  const securityLogs = useSecurityStore((state) => state.allMessages);
  const firmwareLogs = useFirmwareStore((state) => state.allMessages);

  const controllerConnected = useControllerStore((state) => state.isWebSocketOpen);
  const securityConnected = useSecurityStore((state) => state.isWebSocketOpen);
  const firmwareConnected = useFirmwareStore((state) => state.isWebSocketOpen);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const collectedLogsRef = React.useRef<{
    devices: typeof controllerLogs;
    controller: typeof controllerLogs;
    security: typeof securityLogs;
    firmware: typeof firmwareLogs;
    startTime: Date | null;
  }>({
    devices: [],
    controller: [],
    security: [],
    firmware: [],
    startTime: null,
  });

  const formatLogEntry = (
    source: string,
    msg: (typeof controllerLogs)[0] | (typeof securityLogs)[0] | (typeof firmwareLogs)[0],
  ): LogEntry | null => {
    if (msg.type !== 'NOTIFICATION') return null;

    const data = msg.data;
    if (data.type === 'LOG' && data.log) {
      return {
        source,
        timestamp: msg.timestamp.toISOString(),
        type: 'LOG',
        level: data.log.level,
        thread: `${data.log.thread_id}-${data.log.thread_name}`,
        message: typeof data.log.msg === 'string' ? data.log.msg : JSON.stringify(data.log.msg),
      };
    }
    if (data.type === 'DEVICE_CONNECTION' || data.type === 'DEVICE_DISCONNECTION') {
      return {
        source: 'Devices',
        timestamp: msg.timestamp.toISOString(),
        type: data.type,
        serialNumber: data.serialNumber,
        message: data.type === 'DEVICE_CONNECTION' ? 'Device connected' : 'Device disconnected',
      };
    }
    if (data.type === 'DEVICE_STATISTICS') {
      return {
        source: 'Devices',
        timestamp: msg.timestamp.toISOString(),
        type: 'DEVICE_STATISTICS',
        serialNumber: data.serialNumber,
        message: 'New statistics received',
      };
    }
    if (data.type === 'DEVICE_CONNECTIONS_STATISTICS') {
      return {
        source: 'Devices',
        timestamp: msg.timestamp.toISOString(),
        type: 'DEVICE_CONNECTIONS_STATISTICS',
        message: 'Global connection statistics update',
        rawData: JSON.stringify(data.statistics),
      };
    }

    return null;
  };

  const buildExportData = React.useCallback(() => {
    const logs = collectedLogsRef.current;
    const allLogs: LogEntry[] = [];

    // Filter logs that arrived after startTime
    const filterByTime = <T extends { timestamp: Date }>(arr: T[], start: Date | null): T[] => {
      if (!start) return arr;
      return arr.filter((item) => item.timestamp >= start);
    };

    // Process Device logs (connections, disconnections, statistics)
    filterByTime(logs.devices, logs.startTime).forEach((msg) => {
      const entry = formatLogEntry('Devices', msg);
      if (entry) allLogs.push(entry);
    });

    // Process Controller logs
    filterByTime(logs.controller, logs.startTime).forEach((msg) => {
      if (msg.type === 'NOTIFICATION' && msg.data.type === 'LOG') {
        const entry = formatLogEntry('Controller', msg);
        if (entry) allLogs.push(entry);
      }
    });

    // Process Security logs
    filterByTime(logs.security, logs.startTime).forEach((msg) => {
      const entry = formatLogEntry('Security', msg);
      if (entry) allLogs.push(entry);
    });

    // Process Firmware logs
    filterByTime(logs.firmware, logs.startTime).forEach((msg) => {
      const entry = formatLogEntry('Firmware', msg);
      if (entry) allLogs.push(entry);
    });

    // Sort by timestamp
    allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return allLogs;
  }, []);

  const exportToJson = (data: LogEntry[]) => {
    const exportObj = {
      exportedAt: new Date().toISOString(),
      collectionDuration: `${duration} minute(s)`,
      totalLogs: data.length,
      logs: data,
    };
    const jsonString = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-logs-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = (data: LogEntry[]) => {
    const headers = ['Source', 'Timestamp', 'Type', 'Level', 'Thread', 'Serial Number', 'Message', 'Raw Data'];
    const rows = data.map((log) => [
      log.source,
      log.timestamp,
      log.type,
      log.level || '',
      log.thread || '',
      log.serialNumber || '',
      `"${(log.message || '').replace(/"/g, '""')}"`,
      `"${(log.rawData || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-logs-export-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStartCollection = () => {
    const now = new Date();
    setStartTime(now);
    setIsCollecting(true);
    setTimeRemaining(duration * 60);

    collectedLogsRef.current = {
      devices: [],
      controller: [],
      security: [],
      firmware: [],
      startTime: now,
    };

    toast({
      id: 'collection-started',
      title: t('logs.collection_started'),
      description: t('logs.collection_started_desc', { minutes: duration }),
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleStopCollection = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Capture final state of logs
    collectedLogsRef.current = {
      devices: [...controllerLogs],
      controller: [...controllerLogs],
      security: [...securityLogs],
      firmware: [...firmwareLogs],
      startTime: collectedLogsRef.current.startTime,
    };

    const data = buildExportData();

    if (data.length === 0) {
      toast({
        id: 'no-logs',
        title: t('common.warning'),
        description: t('logs.no_logs_collected'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } else {
      if (format === 'json') {
        exportToJson(data);
      } else {
        exportToCsv(data);
      }

      toast({
        id: 'export-success',
        title: t('common.success'),
        description: t('logs.export_success', { count: data.length }),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }

    setIsCollecting(false);
    setTimeRemaining(0);
    setStartTime(null);
  }, [controllerLogs, securityLogs, firmwareLogs, format, duration, buildExportData, t, toast]);

  // Timer countdown
  React.useEffect(() => {
    if (isCollecting && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleStopCollection();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
    return undefined;
  }, [isCollecting, handleStopCollection]);

  // Cleanup on unmount
  React.useEffect(
    () => () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    [],
  );

  // Warn user before leaving page or refreshing during collection
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCollecting) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCollecting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration * 60 > 0 ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;

  const connectedCount = [controllerConnected, securityConnected, firmwareConnected].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <Text fontSize="xl" fontWeight="bold">
          {t('logs.export_all_title')}
        </Text>
        <Box flex={1} />
        {isCollecting ? (
          <Button colorScheme="red" leftIcon={<Stop size={20} />} onClick={handleStopCollection}>
            {t('logs.stop_and_export')}
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            leftIcon={<Play size={20} />}
            onClick={handleStartCollection}
            isDisabled={connectedCount === 0}
          >
            {t('logs.start_collection')}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <Box>
          {isCollecting ? (
            <Center flexDirection="column" py={8}>
              <CircularProgress value={progress} size="150px" thickness="8px" color="blue.400">
                <CircularProgressLabel>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatTime(timeRemaining)}
                  </Text>
                </CircularProgressLabel>
              </CircularProgress>
              <Text mt={4} fontSize="lg">
                {t('logs.collecting_logs')}
              </Text>
              <Text mt={2} color="gray.500">
                {t('logs.logs_will_export', { format: format.toUpperCase() })}
              </Text>
              <Box mt={4}>
                <Text fontSize="sm" color="gray.500" mb={2}>{t('logs.logs_collected')}:</Text>
                <HStack spacing={4}>
                  <Text fontSize="sm">
                    {t('devices.title')}: {startTime ? controllerLogs.filter((m) => m.timestamp >= startTime).length : 0}
                  </Text>
                  <Text fontSize="sm">
                    {t('simulation.controller')}: {startTime ? controllerLogs.filter((m) => m.timestamp >= startTime && m.data?.type === 'LOG').length : 0}
                  </Text>
                  <Text fontSize="sm">
                    {t('logs.security')}: {startTime ? securityLogs.filter((m) => m.timestamp >= startTime).length : 0}
                  </Text>
                  <Text fontSize="sm">
                    {t('logs.firmware')}: {startTime ? firmwareLogs.filter((m) => m.timestamp >= startTime).length : 0}
                  </Text>
                </HStack>
              </Box>
              <Alert status="warning" mt={6} maxW="400px" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">{t('logs.stay_on_page_warning')}</Text>
              </Alert>
            </Center>
          ) : (
            <Stack spacing={6} maxW="400px">
              <Box>
                <FormLabel>{t('logs.websocket_status')}</FormLabel>
                <Stack spacing={2}>
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg={controllerConnected ? 'green.500' : 'red.500'} />
                    <Text fontSize="sm" fontWeight="medium">{t('simulation.controller')}</Text>
                    <Text fontSize="xs" color="gray.500">
                      ({t('devices.title')}, {t('simulation.controller')})
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg={securityConnected ? 'green.500' : 'red.500'} />
                    <Text fontSize="sm" fontWeight="medium">{t('logs.security')}</Text>
                    <Text fontSize="xs" color="gray.500">
                      ({t('logs.security')})
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg={firmwareConnected ? 'green.500' : 'red.500'} />
                    <Text fontSize="sm" fontWeight="medium">{t('logs.firmware')}</Text>
                    <Text fontSize="xs" color="gray.500">
                      ({t('logs.firmware')})
                    </Text>
                  </HStack>
                </Stack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {t('logs.connected_count', { count: connectedCount })}
                </Text>
              </Box>

              <Box>
                <FormLabel>{t('logs.collection_duration')}</FormLabel>
                <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))} w="200px">
                  <option value={1}>1 {t('common.minute')}</option>
                  <option value={2}>2 {t('common.minutes')}</option>
                  <option value={5}>5 {t('common.minutes')}</option>
                  <option value={10}>10 {t('common.minutes')}</option>
                  <option value={15}>15 {t('common.minutes')}</option>
                  <option value={30}>30 {t('common.minutes')}</option>
                </Select>
              </Box>

              <Box>
                <FormLabel>{t('logs.export_format')}</FormLabel>
                <RadioGroup value={format} onChange={(val) => setFormat(val as ExportFormat)}>
                  <Stack direction="row" spacing={4}>
                    <Radio value="json">JSON</Radio>
                    <Radio value="csv">CSV</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">{t('logs.stay_on_page_info')}</Text>
              </Alert>

              {connectedCount === 0 && (
                <Text color="red.500" fontSize="sm">
                  {t('logs.no_websockets_connected')}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default ExportAllLogsPage;

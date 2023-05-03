import * as React from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Select,
  Spacer,
  Table,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { Download } from '@phosphor-icons/react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { v4 as uuid } from 'uuid';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import ShownLogsDropdown from 'components/ShownLogsDropdown';
import { useFirmwareStore } from 'contexts/FirmwareSocketProvider/useStore';
import { LogLevel } from 'contexts/FirmwareSocketProvider/utils';
import { dateForFilename } from 'helpers/dateFormatting';
import { uppercaseFirstLetter } from 'helpers/stringHelper';

const FmsLogsCard = () => {
  const { t } = useTranslation();
  const { availableLogTypes, hiddenLogIds, setHiddenLogIds, logs } = useFirmwareStore((state) => ({
    logs: state.allMessages,
    availableLogTypes: state.availableLogTypes,
    hiddenLogIds: state.hiddenLogIds,
    setHiddenLogIds: state.setHiddenLogIds,
  }));
  const [level, setLevel] = React.useState<'' | LogLevel>('');

  const data = React.useMemo(() => {
    const arr = logs.filter(
      (d) => d.type === 'NOTIFICATION' && d.data.type === 'LOG' && (level === '' || d.data.log.level === level),
    );
    return arr.reverse();
  }, [logs, level]);

  const colorSchemeMap: Record<LogLevel, string> = {
    information: 'blue',
    critical: 'red',
    debug: 'teal',
    error: 'red',
    fatal: 'purple',
    notice: 'blue',
    trace: 'blue',
    warning: 'yellow',
  };

  type RowProps = { index: number; style: React.CSSProperties };
  const Row = React.useCallback(
    ({ index, style }: RowProps) => {
      const msg = data[index];
      if (msg) {
        if (msg.type === 'NOTIFICATION' && msg.data.type === 'LOG') {
          return (
            <Box style={style}>
              <Flex w="100%">
                <Box flex="0 1 110px">
                  <Text>{msg.timestamp.toLocaleTimeString()}</Text>
                </Box>
                <Box flex="0 1 200px">
                  <Text w="200px" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                    {msg.data.log.source}
                  </Text>
                </Box>
                <Box flex="0 1 140px">
                  <Text w="140px" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                    {msg.data.log.thread_id}-{msg.data.log.thread_name}
                  </Text>
                </Box>
                <Box flex="0 1 110px">
                  <Badge
                    ml={1}
                    size="lg"
                    fontSize="0.9em"
                    variant="solid"
                    colorScheme={colorSchemeMap[msg.data.log.level]}
                  >
                    {msg.data.log.level}
                  </Badge>
                </Box>
                <Box textAlign="left" w="calc(100% - 180px - 210px - 120px - 60px)">
                  <Text textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                    {JSON.stringify(msg.data.log.msg).replace(/"/g, '')}
                  </Text>
                </Box>
              </Flex>
            </Box>
          );
        }
      }
      return null;
    },
    [t, data],
  );

  const downloadableLogs = React.useMemo(
    () =>
      data.map((msg) =>
        msg.type === 'NOTIFICATION' && msg.data.type === 'LOG'
          ? {
              timestamp: msg.timestamp.toLocaleString(),
              thread: `${msg.data.log.thread_id}-${msg.data.log.thread_name}`,
              source: msg.data?.log?.source ?? '-',
              level: msg.data?.log?.level,
              message: JSON.stringify(msg.data?.log?.msg),
            }
          : {},
      ),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <Spacer />
        <HStack spacing={2}>
          <ShownLogsDropdown
            availableLogTypes={availableLogTypes}
            setHiddenLogIds={setHiddenLogIds}
            hiddenLogIds={hiddenLogIds}
          />
          <Select size="md" value={level} onChange={(e) => setLevel(e.target.value as '' | LogLevel)} w="130px">
            <option value="">{t('common.select_all')}</option>
            {Object.keys(colorSchemeMap).map((key) => (
              <option key={uuid()} value={key}>
                {uppercaseFirstLetter(key)}
              </option>
            ))}
          </Select>
          <CSVLink
            filename={`logs_${dateForFilename(new Date().getTime() / 1000)}.csv`}
            data={downloadableLogs as object[]}
          >
            <Tooltip label={t('logs.export')} hasArrow>
              <IconButton aria-label={t('logs.export')} icon={<Download />} colorScheme="blue" />
            </Tooltip>
          </CSVLink>
        </HStack>
      </CardHeader>
      <CardBody>
        <Box overflowX="auto" w="100%">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th w="110px">{t('common.time')}</Th>
                <Th w="200px">{t('logs.source')}</Th>
                <Th w="160px">
                  {t('logs.thread')} ID-{t('common.name')}
                </Th>
                <Th w="90px" pl={0}>
                  {t('logs.level')}
                </Th>
                <Th>{t('logs.message')}</Th>
              </Tr>
            </Thead>
          </Table>
          <Box ml={4} h="calc(70vh)">
            <ReactVirtualizedAutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={data.length}
                  itemSize={35}
                  itemKey={(index) => data[index]?.id ?? uuid()}
                >
                  {Row}
                </List>
              )}
            </ReactVirtualizedAutoSizer>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};

export default FmsLogsCard;

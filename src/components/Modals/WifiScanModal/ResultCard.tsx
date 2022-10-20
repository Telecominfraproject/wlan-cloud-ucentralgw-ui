import React from 'react';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import { JsonViewer } from '@textea/json-viewer';
import { ArrowLeft } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { ScanChannel } from 'models/Device';

interface Props {
  channelInfo: ScanChannel;
}
const ResultCard: React.FC<Props> = ({ channelInfo: { channel, devices } }) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const [ies, setIes] = React.useState<{ content: unknown; name: string; type: number }[] | undefined>();

  return (
    <Card variant="widget">
      <CardHeader display="flex">
        <Heading size="md" my="auto">
          {t('commands.channel')} #{channel} ({devices.length} {t('devices.title')})
        </Heading>
        <Spacer />
        {ies && (
          <IconButton
            size="sm"
            my="auto"
            aria-label={t('common.back')}
            colorScheme="blue"
            icon={<ArrowLeft size={20} />}
            onClick={() => setIes(undefined)}
          />
        )}
      </CardHeader>
      <CardBody>
        <Box h="400px" w="100%" overflowY="auto" overflowX="auto" px={0}>
          {ies ? (
            <Box w="800px">
              {ies.map(({ content, name, type }) => (
                <Box key={uuid()} my={2}>
                  <Heading size="sm" mb={2} textDecor="underline">
                    {name} ({type})
                  </Heading>
                  <JsonViewer
                    rootName={false}
                    displayDataTypes={false}
                    enableClipboard
                    theme={colorMode === 'light' ? undefined : 'dark'}
                    value={content as object}
                    style={{ background: 'unset', display: 'unset' }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Table variant="simple" px={0}>
              <Thead>
                <Tr>
                  <Th>SSID</Th>
                  <Th width="110px" isNumeric>
                    {t('commands.signal')}
                  </Th>
                  <Th w="10px">IEs</Th>
                </Tr>
              </Thead>
              <Tbody>
                {devices.map((dev) => (
                  <Tr key={uuid()}>
                    <Td>{dev.ssid}</Td>
                    <Td width="110px">{dev.signal} db</Td>
                    <Td w="10px">
                      <Button size="sm" colorScheme="blue" onClick={() => setIes(dev.ies ?? [])}>
                        {dev.ies?.length ?? 0}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default ResultCard;

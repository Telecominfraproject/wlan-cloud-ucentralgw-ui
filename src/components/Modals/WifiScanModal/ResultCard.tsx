import React from 'react';
import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
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

  return (
    <Card variant="widget">
      <CardHeader>
        <Heading size="md">
          {t('commands.channel')} #{channel} ({devices.length} {t('devices.title')})
        </Heading>
      </CardHeader>
      <CardBody>
        <Box h="200px" w="100%" overflowY="auto" px={0}>
          <Table variant="simple" px={0}>
            <Thead>
              <Tr>
                <Th>SSID</Th>
                <Th width="110px" isNumeric>
                  {t('commands.signal')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {devices.map((dev) => (
                <Tr key={uuid()}>
                  <Td>{dev.ssid}</Td>
                  <Td width="110px">{dev.signal} db</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </CardBody>
    </Card>
  );
};

export default ResultCard;

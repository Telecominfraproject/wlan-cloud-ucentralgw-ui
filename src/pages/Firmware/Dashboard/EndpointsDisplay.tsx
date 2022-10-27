import * as React from 'react';
import { Heading, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@chakra-ui/react';
import { Info } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { FirmwareDashboardEndpoint } from 'hooks/Network/Firmware';

type Props = {
  data: FirmwareDashboardEndpoint[];
};
const FirmwareDashboardEndpointDisplay = ({ data }: Props) => {
  const { t } = useTranslation();

  return (
    <Card variant="widget" w="100%">
      <CardHeader>
        <Heading mr={2} my="auto" size="md">
          {t('controller.firmware.endpoints')}
        </Heading>
        <Tooltip label={t('controller.firmware.endpoints_explanation')} hasArrow>
          <Info style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        </Tooltip>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Th>{t('system.endpoint')}</Th>
            <Th>{t('devices.title')}</Th>
          </Thead>
          <Tbody>
            {data.map(({ value, tag }) => (
              <Tr key={uuid()}>
                <Td>{tag}</Td>
                <Td>{value}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default FirmwareDashboardEndpointDisplay;

import React, { useMemo } from 'react';
import { Box, Button, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { compactDate } from 'helpers/dateFormatting';
import { bytesString } from 'helpers/stringHelper';
import { Firmware } from 'models/Firmware';

interface Props {
  firmware: Firmware[];
  upgrade: (uri: string) => void;
  isLoading: boolean;
}
const FirmwareList: React.FC<Props> = ({ firmware, upgrade, isLoading }) => {
  const { t } = useTranslation();

  const sortedFirmware = useMemo(() => firmware.sort((a, b) => b.created - a.created), [firmware]);

  return (
    <Box h="600px" w="100%" overflowY="auto" px={0}>
      <Table px={0}>
        <Thead>
          <Tr>
            <Th px={0} py={1} w="200px">
              {t('commands.image_date')}
            </Th>
            <Th px={0} py={1} width="160px">
              {t('common.size')}
            </Th>
            <Th px={0} py={1}>
              {t('commands.revision')}
            </Th>
            <Th px={0} py={1} />
          </Tr>
        </Thead>
        <Tbody>
          {sortedFirmware.map(({ created, size, revision, uri }) => (
            <Tr key={uuid()}>
              <Td px={0} py={1} w="200px">
                {compactDate(created)}
              </Td>
              <Td px={0} py={1} width="160px">
                {bytesString(size)}
              </Td>
              <Td px={0} py={1}>
                {revision}
              </Td>
              <Td px={0} py={1}>
                <Button colorScheme="blue" onClick={() => upgrade(uri)} isLoading={isLoading}>
                  {t('commands.upgrade')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default FirmwareList;

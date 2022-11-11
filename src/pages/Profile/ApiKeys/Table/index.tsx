import * as React from 'react';
import { Box, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CreateApiKeyButton from './AddButton';
import useApiKeyTable from './useApiKeyTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';

type Props = {
  userId: string;
};

const ApiKeyTable = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { query, columns, hiddenColumns } = useApiKeyTable({ userId });

  return (
    <Box>
      <Flex mb={2}>
        <Heading size="md" my="auto">
          {t('keys.other')} ({query.data?.apiKeys.length})
        </Heading>
        <Spacer />
        <HStack spacing={2}>
          <CreateApiKeyButton userId={userId} apiKeys={query.data?.apiKeys ?? []} />
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns[0]}
            setHiddenColumns={hiddenColumns[1]}
            preference="apiKeys.profile.table.hiddenColumns"
          />
          <RefreshButton onClick={query.refetch} isFetching={query.isFetching} isCompact />
        </HStack>
      </Flex>
      <Box>
        <DataTable
          columns={columns as Column<object>[]}
          saveSettingsId="apiKeys.profile.table"
          data={query.data?.apiKeys ?? []}
          obj={t('keys.other')}
          sortBy={[{ id: 'expiresOn', desc: false }]}
          minHeight="400px"
          hiddenColumns={hiddenColumns[0]}
          showAllRows
          hideControls
        />
      </Box>
    </Box>
  );
};

export default ApiKeyTable;

import * as React from 'react';
import { Box, Button, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ScriptTableActions from './Actions';
import CreateScriptButton from './CreateButton';
import useScriptsTable from './useScriptsTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Script } from 'hooks/Network/Scripts';
import { Column } from 'models/Table';

type Props = {
  onIdSelect: (newId: string) => void;
};

const ScriptTableCard = ({ onIdSelect }: Props) => {
  const { t } = useTranslation();
  const { query, hiddenColumns } = useScriptsTable();
  const { id } = useParams();

  const dateCell = React.useCallback((date: number) => <FormattedDate date={date} />, []);
  const actionCell = React.useCallback(
    (script: Script) => <ScriptTableActions script={script} onSelect={onIdSelect} />,
    [],
  );
  const nameCell = React.useCallback(
    (script: Script) => (
      <Button variant="link" onClick={() => onIdSelect(script.id)} size="sm">
        {script.name}
      </Button>
    ),
    [],
  );
  const columns = React.useMemo(
    (): Column<Script>[] => [
      {
        id: 'name',
        Header: t('common.name'),
        Footer: '',
        accessor: 'name',
        alwaysShow: true,
        Cell: ({ cell }) => nameCell(cell.row.original),
        customWidth: '120px',
      },
      {
        id: 'author',
        Header: t('script.author'),
        Footer: '',
        accessor: 'author',
        customWidth: '120px',
      },
      {
        id: 'version',
        Header: t('footer.version'),
        Footer: '',
        accessor: 'version',
        customWidth: '120px',
      },
      {
        id: 'modified',
        Header: t('common.modified'),
        Footer: '',
        Cell: ({ cell }) => dateCell(cell.row.original.modified),
        accessor: 'modified',
        customWidth: '120px',
      },
      {
        id: 'description',
        Header: t('common.description'),
        Footer: '',
        accessor: 'description',
      },
      {
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        Cell: (v) => actionCell(v.cell.row.original),
        disableSortBy: true,
        customWidth: '120px',
        alwaysShow: true,
      },
    ],
    [t],
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="md">
          {t('script.other')} {query.data ? `(${query.data.length})` : ''}
        </Heading>
        <Spacer />
        <HStack>
          <CreateScriptButton onIdSelect={onIdSelect} />
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns[0]}
            setHiddenColumns={hiddenColumns[1]}
            preference="scripts.page.table.hiddenColumns"
            isCompact
          />
          <RefreshButton onClick={query.refetch} isFetching={query.isFetching} isCompact colorScheme="blue" />
        </HStack>
      </CardHeader>
      <CardBody>
        <Box w="100%" h="300px" overflowY="auto">
          <DataTable<Script>
            columns={columns}
            saveSettingsId="apiKeys.profile.table"
            data={query.data ?? []}
            obj={t('script.other')}
            sortBy={[{ id: 'name', desc: false }]}
            minHeight="300px"
            hiddenColumns={hiddenColumns[0]}
            showAllRows
            hideControls
            onRowClick={(script) => onIdSelect(script.id)}
            isRowClickable={(script) => script.id !== id}
          />
        </Box>
      </CardBody>
    </Card>
  );
};

export default ScriptTableCard;

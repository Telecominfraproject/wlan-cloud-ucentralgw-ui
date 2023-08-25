import * as React from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CreateDefaultFirmwareModal from '../CreateModal';
import DeleteDefaultFirmwaresButton from '../DeleteButton';
import Actions from './Actions';
import EditDefaultFirmware from './EditModal';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import { DefaultFirmware, useGetDefaultFirmware } from 'hooks/Network/DefaultFirmware';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { getRevision } from 'helpers/stringHelper';
import { DataGrid } from 'components/DataTables/DataGrid';

const DefaultFirmwareList = () => {
  const { t } = useTranslation();
  const tableController = useDataGrid({
    tableSettingsId: 'controller.default_firmware.table',
    defaultOrder: ['deviceType', 'revision', 'modified', 'description', 'actions'],
    defaultSortBy: [{ id: 'deviceType', desc: true }],
  });
  const getFirmware = useGetDefaultFirmware();
  const modalProps = useDisclosure();
  const [selectedFirmware, setSelectedFirmware] = React.useState<DefaultFirmware | undefined>();

  const onViewDetails = (config: DefaultFirmware) => {
    setSelectedFirmware(config);
    modalProps.onOpen();
  };
  const onRowClick = React.useCallback((row: DefaultFirmware) => () => onViewDetails(row), []);

  const dateCell = React.useCallback((v: number) => <FormattedDate date={v} />, []);
  const actionCell = React.useCallback(
    (firmware: DefaultFirmware) => <Actions firmware={firmware} handleViewDetails={onViewDetails} />,
    [],
  );
  const revisionCell = React.useCallback((v: string) => getRevision(v), []);

  const columns: DataGridColumn<DefaultFirmware>[] = React.useMemo(
    () =>
      [
        {
          id: 'deviceType',
          header: t('common.type'),
          accessorKey: 'deviceType',
          meta: {
            customWidth: '150px',
            alwaysShow: true,
            anchored: true,
          },
        },
        {
          id: 'revision',
          header: t('commands.revision'),
          accessorKey: 'revision',
          cell: ({ cell }) => revisionCell(cell.row.original.revision),
          meta: {
            customWidth: '150px',
            alwaysShow: true,
          },
        },
        {
          id: 'modified',
          header: t('common.modified'),
          accessorKey: 'modified',
          cell: ({ cell }) => dateCell(cell.row.original.lastModified),
          meta: {
            customWidth: '50px',
          },
        },
        {
          id: 'description',
          header: t('common.description'),
          accessorKey: 'description',
        },
        {
          id: 'actions',
          header: t('common.actions'),
          accessorKey: 'actions',
          cell: (v) => actionCell(v.cell.row.original),
          enableSorting: false,
          meta: {
            customWidth: '50px',
            alwaysShow: true,
          },
        },
      ] satisfies DataGridColumn<DefaultFirmware>[],
    [dateCell],
  );

  return (
    <Box overflowX="auto" w="100%">
      <DataGrid<DefaultFirmware>
        controller={tableController}
        header={{
          title: `${t('common.default')} ${t('firmware.one')} ${
            getFirmware.data ? `(${getFirmware.data.firmwares.length})` : ''
          }`,
          objectListed: t('analytics.firmware'),
          otherButtons: <DeleteDefaultFirmwaresButton />,
          addButton: <CreateDefaultFirmwareModal />,
        }}
        columns={columns}
        data={getFirmware.data?.firmwares}
        isLoading={getFirmware.isFetching}
        options={{
          onRowClick: (firmw) => onRowClick(firmw),
          refetch: getFirmware.refetch,
          minimumHeight: '200px',
          showAsCard: true,
          isHidingControls: true,
          isManual: true,
        }}
      />
      {selectedFirmware ? <EditDefaultFirmware modalProps={modalProps} defaultFirmware={selectedFirmware} /> : null}
    </Box>
  );
};

export default DefaultFirmwareList;

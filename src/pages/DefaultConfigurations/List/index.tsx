import * as React from 'react';
import { Box, Heading, Spacer, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Actions from './Actions';
import CreateDefaultConfigurationModal from './CreateModal';
import EditDefaultConfiguration from './EditModal';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { DataTable } from 'components/DataTables/DataTable';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { LoadingOverlay } from 'components/LoadingOverlay';
import { DefaultConfigurationResponse, useGetDefaultConfigurations } from 'hooks/Network/DefaultConfigurations';
import { Column } from 'models/Table';

const DefaultConfigurationsList = () => {
  const { t } = useTranslation();
  const getConfigs = useGetDefaultConfigurations({});
  const modalProps = useDisclosure();
  const [selectedConfig, setSelectedConfig] = React.useState<DefaultConfigurationResponse | undefined>();

  const onViewDetails = (config: DefaultConfigurationResponse) => {
    setSelectedConfig(config);
    modalProps.onOpen();
  };

  const dateCell = React.useCallback((v: number) => <FormattedDate date={v} />, []);
  const deviceTypesCell = React.useCallback((v: string[]) => {
    if (v.length === 0) {
      return t('common.none');
    }
    if (v.length <= 3) {
      return v.join(', ');
    }
    return `${v.join(', ')}...`;
  }, []);
  const actionCell = React.useCallback(
    (config: DefaultConfigurationResponse) => <Actions config={config} handleViewDetails={onViewDetails} />,
    [],
  );

  const columns: Column<DefaultConfigurationResponse>[] = React.useMemo(
    () => [
      {
        id: 'name',
        Header: t('common.name'),
        Footer: '',
        accessor: 'name',
        customWidth: '150px',
        alwaysShow: true,
      },
      {
        id: 'modified',
        Header: t('common.modified'),
        Footer: '',
        accessor: 'modified',
        Cell: ({ cell }) => dateCell(cell.row.original.lastModified),
        customWidth: '50px',
      },
      {
        id: 'modelIds',
        Header: t('controller.dashboard.device_types'),
        Footer: '',
        accessor: 'modelIds',
        Cell: ({ cell }) => deviceTypesCell(cell.row.original.modelIds),
        customWidth: '50px',
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
        accessor: 'actions',
        Cell: (v) => actionCell(v.cell.row.original),
        customWidth: '50px',
        alwaysShow: true,
        disableSortBy: true,
      },
    ],
    [dateCell],
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="md">
          {t('controller.configurations.title')} {getConfigs.data ? `(${getConfigs.data.length})` : ''}
        </Heading>
        <Spacer />
        <CreateDefaultConfigurationModal />
        <RefreshButton onClick={getConfigs.refetch} isCompact isFetching={getConfigs.isFetching} />
      </CardHeader>
      <CardBody>
        <Box overflowX="auto" w="100%">
          <LoadingOverlay isLoading={getConfigs.isFetching}>
            <DataTable
              columns={columns as Column<object>[]}
              saveSettingsId="firmware.table"
              data={getConfigs.data ?? []}
              obj={t('controller.configurations.title')}
              minHeight="200px"
              sortBy={[{ id: 'name', desc: true }]}
            />
          </LoadingOverlay>
        </Box>
      </CardBody>
      <EditDefaultConfiguration modalProps={modalProps} config={selectedConfig} />
    </Card>
  );
};

export default DefaultConfigurationsList;

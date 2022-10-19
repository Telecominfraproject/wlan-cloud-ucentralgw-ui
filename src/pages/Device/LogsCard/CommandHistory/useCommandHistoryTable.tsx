import * as React from 'react';
import { Badge, Box, HStack, IconButton, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { MagnifyingGlass, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { DeviceCommandHistory, useDeleteCommand, useGetCommandHistory } from 'hooks/Network/Commands';
import { uppercaseFirstLetter } from 'helpers/stringHelper';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
  limit: number;
};

const useCommandHistoryTable = ({ serialNumber, limit }: Props) => {
  const { t } = useTranslation();
  const getCommands = useGetCommandHistory({ serialNumber, limit });
  const deleteCommand = useDeleteCommand();
  const [selectedCommand, setSelectedCommand] = React.useState<DeviceCommandHistory | undefined>();
  const detailsModalProps = useDisclosure();
  const [loadingDeleteSerial, setLoadingDeleteSerial] = React.useState<string | undefined>();
  const toast = useToast();

  const onOpenDetails = React.useCallback(
    (command: DeviceCommandHistory) => () => {
      setSelectedCommand(command);
      detailsModalProps.onOpen();
    },
    [],
  );

  const onDeleteClick = React.useCallback(
    (command: DeviceCommandHistory) => () => {
      setLoadingDeleteSerial(command.UUID);
      deleteCommand.mutate(command.UUID, {
        onSuccess: () => {
          setLoadingDeleteSerial(undefined);
          toast({
            id: `success-delete-command-${command.UUID}`,
            title: t('common.success'),
            description: t('controller.crud.delete_success_obj', {
              obj: uppercaseFirstLetter(command.command),
            }),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        },
        onError: (e) => {
          const error = e as AxiosError;
          setLoadingDeleteSerial(undefined);
          toast({
            id: `error-delete-command-${command.UUID}`,
            title: t('common.error'),
            description: error?.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        },
      });
    },
    [],
  );

  const dateCell = React.useCallback(
    (v: number) => (
      <Box>
        <FormattedDate date={v} />
      </Box>
    ),
    [],
  );
  const capitalizeFirstLetterCell = React.useCallback((v: string) => <>{uppercaseFirstLetter(v)}</>, []);
  const statusCell = React.useCallback((v: string) => {
    let colorScheme = 'red';
    if (v === 'completed') colorScheme = 'green';

    return (
      <Badge colorScheme={colorScheme} variant="solid">
        {v}
      </Badge>
    );
  }, []);
  const actionCell = React.useCallback(
    (command: DeviceCommandHistory) => (
      <HStack>
        <Tooltip label={t('common.view_details')}>
          <IconButton
            aria-label={t('common.view_details')}
            onClick={onOpenDetails(command)}
            colorScheme="blue"
            icon={<MagnifyingGlass size={20} />}
            size="sm"
            isLoading={loadingDeleteSerial === command.UUID}
          />
        </Tooltip>
        <Tooltip label={t('crud.delete')}>
          <IconButton
            aria-label={t('crud.delete')}
            onClick={onDeleteClick(command)}
            colorScheme="red"
            icon={<Trash size={20} />}
            size="sm"
            isLoading={loadingDeleteSerial === command.UUID}
          />
        </Tooltip>
      </HStack>
    ),
    [loadingDeleteSerial],
  );

  const columns: Column<DeviceCommandHistory>[] = React.useMemo(
    (): Column<DeviceCommandHistory>[] => [
      {
        id: 'submitted',
        Header: t('common.submitted'),
        Footer: '',
        accessor: 'submitted',
        Cell: (v) => dateCell(v.cell.row.original.submitted),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'command',
        Header: t('controller.devices.command_one'),
        Footer: '',
        accessor: 'command',
        Cell: (v) => capitalizeFirstLetterCell(v.cell.row.original.command),
        customWidth: '35px',
        alwaysShow: true,
        disableSortBy: true,
      },
      {
        id: 'status',
        Header: t('common.status'),
        Footer: '',
        accessor: 'status',
        Cell: (v) => statusCell(v.cell.row.original.status),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: 'executed',
        Header: t('controller.devices.executed'),
        Footer: '',
        accessor: 'executed',
        Cell: (v) => dateCell(v.cell.row.original.executed),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'completed',
        Header: t('common.completed'),
        Footer: '',
        accessor: 'completed',
        Cell: (v) => dateCell(v.cell.row.original.completed),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'errorCode',
        Header: t('controller.devices.error_code'),
        Footer: '',
        accessor: 'errorCode',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        accessor: 'actions',
        Cell: (v) => actionCell(v.cell.row.original),
        customWidth: '35px',
        disableSortBy: true,
      },
    ],
    [t, actionCell],
  );

  return {
    columns,
    getCommands,
    selectedCommand,
    detailsModalProps,
  };
};

export default useCommandHistoryTable;

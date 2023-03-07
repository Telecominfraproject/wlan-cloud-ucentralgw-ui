import React, { useCallback, useState } from 'react';
import { Avatar, Box, Button, Flex, useDisclosure } from '@chakra-ui/react';
import { ArrowsClockwise } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { ColumnPicker } from '../../../components/DataTables/ColumnPicker';
import { DataTable } from '../../../components/DataTables/DataTable';
import FormattedDate from '../../../components/InformationDisplays/FormattedDate';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import UserActions from './UserActions';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useAuth } from 'contexts/AuthProvider';
import { useGetUsers } from 'hooks/Network/Users';
import { Column } from 'models/Table';
import { User } from 'models/User';

const UserTable = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editId, setEditId] = useState('');
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { isOpen: editOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure();
  const { data: users, refetch: refreshUsers, isFetching } = useGetUsers();

  const openEditModal = React.useCallback((editUser: User) => {
    setEditId(editUser.id);
    openEdit();
  }, []);

  const memoizedActions = useCallback(
    (userActions: User) => (
      <UserActions user={userActions} refreshTable={refreshUsers} key={uuid()} openEdit={openEditModal} />
    ),
    [],
  );
  const memoizedDate = useCallback((date: number) => <FormattedDate date={date} key={uuid()} />, []);

  const memoizedAvatar = useCallback((name: string, avatar: string) => <Avatar name={name} src={avatar} />, []);

  // Columns array. This array contains your table headings and accessors which maps keys from data array
  const columns = React.useMemo(() => {
    const baseColumns: Column<User>[] = [
      {
        id: 'avatar',
        Header: t('account.avatar'),
        Footer: '',
        accessor: 'avatar',
        customWidth: '32px',
        Cell: ({ cell }) => memoizedAvatar(cell.row.original.name, cell.row.original.avatar),
        disableSortBy: true,
        alwaysShow: true,
      },
      {
        id: 'email',
        Header: t('users.login_id'),
        Footer: '',
        accessor: 'email',
        customWidth: 'calc(15vh)',
        customMinWidth: '150px',
        hasPopover: true,
        alwaysShow: true,
      },
      {
        id: 'name',
        Header: t('common.name'),
        Footer: '',
        accessor: 'name',
        customMaxWidth: '200px',
        customWidth: 'calc(15vh)',
        customMinWidth: '150px',
      },
      {
        id: 'userRole',
        Header: t('users.role'),
        Footer: '',
        accessor: 'userRole',
        customMinWidth: '80px',
        customWidth: '80px',
      },
      {
        id: 'lastLogin',
        Header: t('users.last_login'),
        Footer: '',
        accessor: 'lastLogin',
        Cell: ({ cell }) => memoizedDate(cell.row.original.lastLogin),
        customMinWidth: '150px',
        customWidth: '150px',
      },
      {
        id: 'description',
        Header: t('common.description'),
        Footer: '',
        accessor: 'description',
        disableSortBy: true,
      },
    ];
    if (user?.userRole !== 'csr')
      baseColumns.push({
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        accessor: 'Id',
        customWidth: '80px',
        Cell: ({ cell }) => memoizedActions(cell.row.original),
        disableSortBy: true,
        alwaysShow: true,
      });

    return baseColumns;
  }, [t, user]);

  return (
    <>
      <Card>
        <CardHeader mb="10px">
          <Flex w="100%" flexDirection="row" alignItems="center">
            <Box ms="auto">
              <ColumnPicker
                columns={columns as Column<unknown>[]}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
                preference="provisioning.userTable.hiddenColumns"
              />
              <CreateUserModal />
              <Button
                colorScheme="gray"
                onClick={() => refreshUsers()}
                rightIcon={<ArrowsClockwise />}
                ml={2}
                isLoading={isFetching}
              >
                {t('common.refresh')}
              </Button>
            </Box>
          </Flex>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto" w="100%">
            <DataTable<User>
              columns={columns}
              data={users ?? []}
              isLoading={isFetching}
              obj={t('users.title')}
              sortBy={[{ id: 'email', desc: false }]}
              hiddenColumns={hiddenColumns}
              fullScreen
              onRowClick={openEditModal}
            />
          </Box>
        </CardBody>
      </Card>
      <EditUserModal isOpen={editOpen} onClose={closeEdit} userId={editId} />
    </>
  );
};

export default UserTable;

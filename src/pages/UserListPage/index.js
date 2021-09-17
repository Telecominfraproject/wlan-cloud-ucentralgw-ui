import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserListTable, useAuth, useToast } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import CreateUserModal from 'components/CreateUserModal';
import EditUserModal from 'components/EditUserModal';

const UserListPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [page, setPage] = useState({ selected: 0 });
  const [users, setUsers] = useState([]);
  const [usersToDisplay, setUsersToDisplay] = useState([]);
  const [userToEdit, setUserToEdit] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(getItem('devicesPerPage') || '10');

  const toggleCreateModal = () => {
    setShowCreateModal(!showCreateModal);
  };

  const toggleEditModal = (userId) => {
    if (userId) setUserToEdit(userId);
    setShowEditModal(!showEditModal);
  };

  const getUsers = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralsec}/api/v1/users?idOnly=true`, {
        headers,
      })
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getAvatarPromises = (userIds) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      responseType: 'arraybuffer',
    };

    const promises = userIds.map(async (id) =>
      axiosInstance.get(
        `${endpoints.ucentralsec}/api/v1/avatar/${id}?timestamp=${new Date().toString()}`,
        options,
      ),
    );

    return promises;
  };

  const displayUsers = async () => {
    setLoading(true);

    const startIndex = page.selected * usersPerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(usersPerPage, 10);
    const idsToGet = users
      .slice(startIndex, endIndex)
      .map((x) => encodeURIComponent(x))
      .join(',');

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    const avatarRequests = getAvatarPromises(users.slice(startIndex, endIndex));

    const avatars = await Promise.all(avatarRequests).then((results) =>
      results.map((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        return `data:;base64,${base64}`;
      }),
    );

    axiosInstance
      .get(`${endpoints.ucentralsec}/api/v1/users?select=${idsToGet}`, {
        headers,
      })
      .then((response) => {
        const newUsers = response.data.users.map((user, index) => {
          const newUser = {
            ...user,
            avatar: avatars[index],
          };
          return newUser;
        });
        setUsersToDisplay(newUsers);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const deleteUser = (userId) => {
    setDeleteLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .delete(`${endpoints.ucentralsec}/api/v1/user/${userId}`, {
        headers,
      })
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('user.delete_success'),
          color: 'success',
          autohide: true,
        });
        getUsers();
      })
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('user.delete_failure'),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const updateUsersPerPage = (value) => {
    setItem('usersPerPage', value);
    setUsersPerPage(value);
  };

  useEffect(() => {
    if (users.length > 0) {
      displayUsers();
    } else {
      setUsersToDisplay([]);
      setLoading(false);
    }
  }, [users, usersPerPage, page]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (users !== []) {
      const count = Math.ceil(users.length / usersPerPage);
      setPageCount(count);
    }
  }, [usersPerPage, users]);

  return (
    <div>
      <UserListTable
        t={t}
        users={usersToDisplay}
        loading={loading}
        usersPerPage={usersPerPage}
        setUsersPerPage={updateUsersPerPage}
        pageCount={pageCount}
        setPage={setPage}
        deleteUser={deleteUser}
        deleteLoading={deleteLoading}
        toggleCreate={toggleCreateModal}
        toggleEdit={toggleEditModal}
        refreshUsers={getUsers}
      />
      <CreateUserModal show={showCreateModal} toggle={toggleCreateModal} getUsers={getUsers} />
      <EditUserModal
        show={showEditModal}
        toggle={toggleEditModal}
        userId={userToEdit}
        getUsers={getUsers}
      />
    </div>
  );
};

export default UserListPage;

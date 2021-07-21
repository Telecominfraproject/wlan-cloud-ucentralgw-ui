import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import { UserListTable } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import { useAuth } from 'contexts/AuthProvider';
import CreateUserModal from 'components/CreateUserModal';
import EditUserModal from 'components/EditUserModal';

const UserListPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState([]);
  const [usersToDisplay, setUsersToDisplay] = useState([]);
  const [userToEdit, setUserToEdit] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    success: true,
  });
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
        setToast({
          success: true,
          show: true,
        });
        getUsers();
      })
      .catch(() => {
        setToast({
          success: true,
          show: true,
        });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const displayUsers = () => {
    setLoading(true);

    const startIndex = page * usersPerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(usersPerPage, 10);
    const idsToGet = users
      .slice(startIndex, endIndex)
      .map((x) => encodeURIComponent(x))
      .join(',');

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralsec}/api/v1/users?select=${idsToGet}`, {
        headers,
      })
      .then((response) => {
        setUsersToDisplay(response.data.users);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
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
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color="success"
          className="text-white align-items-center"
          show={toast.show}
        >
          <CToastHeader closeButton>{t('common.success')}</CToastHeader>
          <div className="d-flex">
            <CToastBody>
              {toast.success ? t('user.delete_success') : t('user.delete_failure')}
            </CToastBody>
          </div>
        </CToast>
      </CToaster>
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserListPage as Page, useAuth, useToast } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

const UserListPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();

  return (
    <Page
      t={t}
      currentToken={currentToken}
      endpoints={endpoints}
      addToast={addToast}
      axiosInstance={axiosInstance}
    />
  );
};

export default UserListPage;

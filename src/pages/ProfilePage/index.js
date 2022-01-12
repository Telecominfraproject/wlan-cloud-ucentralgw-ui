import React from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { ProfilePage as Page } from 'ucentral-libs';

const ProfilePage = () => {
  const { t } = useTranslation();
  return <Page t={t} axiosInstance={axiosInstance} />;
};

export default ProfilePage;

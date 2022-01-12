import React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemPage as Page, useToast, useAuth } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

const SystemPage = () => {
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

export default SystemPage;

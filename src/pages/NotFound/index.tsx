import React from 'react';
import { Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return <Heading size="lg">{t('common.not_found')}</Heading>;
};

export default NotFoundPage;

import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Flex flexDirection="column" pt="75px">
      <Heading size="lg">{t('common.not_found')}</Heading>
    </Flex>
  );
};

export default NotFoundPage;

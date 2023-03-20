import * as React from 'react';
import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Article } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import SystemLoggingModal from './Modal';
import { EndpointApiResponse } from 'hooks/Network/Endpoints';

type Props = {
  endpoint: EndpointApiResponse;
  token: string;
};

const SystemLoggingButton = ({ endpoint, token }: Props) => {
  const { t } = useTranslation();
  const modalProps = useDisclosure();

  return (
    <>
      <Tooltip label={t('system.logging')} hasArrow>
        <IconButton
          aria-label={t('system.logging')}
          colorScheme="teal"
          type="button"
          my="auto"
          onClick={modalProps.onOpen}
          icon={<Article size={20} />}
          mr={2}
        />
      </Tooltip>
      <SystemLoggingModal modalProps={modalProps} endpoint={endpoint.uri} token={token} />
    </>
  );
};

export default SystemLoggingButton;

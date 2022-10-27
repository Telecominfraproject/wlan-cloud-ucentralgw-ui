import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
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
      <Button colorScheme="teal" onClick={modalProps.onOpen} mr={2} my="auto">
        {t('system.logging')}
      </Button>
      <SystemLoggingModal modalProps={modalProps} endpoint={endpoint.uri} token={token} />
    </>
  );
};

export default SystemLoggingButton;

import * as React from 'react';
import { Box, Heading, IconButton, Spacer, Tooltip, useDisclosure } from '@chakra-ui/react';
import { ArrowsOut, Info } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card';
import { CardBody } from '../Card/CardBody';
import { CardHeader } from '../Card/CardHeader';
import { Modal } from 'components/Modals/Modal';

type Props = {
  chart: React.ReactNode;
  explanation: string;
  title: string;
};
const GraphStatDisplay = ({ chart, title, explanation }: Props) => {
  const { t } = useTranslation();
  const modalProps = useDisclosure();

  return (
    <>
      <Card variant="widget" w="100%">
        <CardHeader>
          <Heading mr={2} my="auto" size="md">
            {title}
          </Heading>
          <Tooltip label={explanation} hasArrow>
            <Info style={{ marginTop: 'auto', marginBottom: 'auto' }} />
          </Tooltip>
          <Spacer />
          <Tooltip label={t('controller.dashboard.expand')} hasArrow>
            <IconButton
              aria-label={t('controller.dashboard.expand')}
              variant="outline"
              my="auto"
              colorScheme="black"
              size="sm"
              onClick={modalProps.onOpen}
              icon={<ArrowsOut size={20} />}
            />
          </Tooltip>
        </CardHeader>
        <CardBody>{chart}</CardBody>
      </Card>
      <Modal title={title} {...modalProps}>
        <Box>
          <Heading size="sm" mb={4}>
            {explanation}
          </Heading>
          {chart}
        </Box>
      </Modal>
    </>
  );
};

export default GraphStatDisplay;

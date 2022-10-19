import * as React from 'react';
import { Box, Button, Text, useClipboard } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type Props = {
  uri: string;
};
const UriCell = ({ uri }: Props) => {
  const { t } = useTranslation();
  const copy = useClipboard(uri);

  return (
    <Box display="flex">
      <Button onClick={copy.onCopy} size="xs" colorScheme="teal" mr={2}>
        {copy.hasCopied ? `${t('common.copied')}!` : t('common.copy')}
      </Button>
      <Text my="auto">{uri}</Text>
    </Box>
  );
};
export default UriCell;

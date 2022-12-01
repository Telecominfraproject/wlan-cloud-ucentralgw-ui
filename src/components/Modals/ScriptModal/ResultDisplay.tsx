import * as React from 'react';
import { Box, Button, Center, Code } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DeviceCommandHistory, useDownloadScriptResult } from 'hooks/Network/Commands';

type Props = {
  result: DeviceCommandHistory;
};

const ScriptResultDisplay = ({ result }: Props) => {
  const { t } = useTranslation();
  const download = useDownloadScriptResult({ serialNumber: result.serialNumber, commandId: result.UUID });

  const onDownload = () => {
    download.refetch();
  };

  if (result.details?.uri !== undefined) {
    return (
      <Center my="100px">
        <Button
          onClick={onDownload}
          colorScheme="blue"
          isLoading={download.isFetching}
          isDisabled={result.waitingForFile === 1}
        >
          {result.waitingForFile === 0 ? t('common.download') : t('script.file_not_ready')}
        </Button>
      </Center>
    );
  }
  return (
    <Box>
      <Box maxH="500px" overflowY="auto" mt={2}>
        <Code whiteSpace="pre-line">{result.results?.status?.result ?? JSON.stringify(result.results, null, 2)}</Code>
      </Box>
    </Box>
  );
};

export default ScriptResultDisplay;

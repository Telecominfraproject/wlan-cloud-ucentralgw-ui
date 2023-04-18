import * as React from 'react';
import { Download } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { DeviceCommandHistory, useDownloadScriptResult } from 'hooks/Network/Commands';

type Props = {
  command?: DeviceCommandHistory;
};
const DownloadScriptButton = ({ command }: Props) => {
  const { t } = useTranslation();
  const download = useDownloadScriptResult({
    serialNumber: command?.serialNumber ?? '',
    commandId: command?.UUID ?? '',
  });

  if (
    !command ||
    command.command !== 'script' ||
    command.details?.uri === undefined ||
    command.details?.uri === '' ||
    command.status !== 'completed' ||
    command.errorCode !== 0
  )
    return null;

  return (
    <ResponsiveButton
      color="gray"
      icon={<Download size={20} />}
      isCompact
      label={t('common.download')}
      isLoading={download.isFetching}
      onClick={download.refetch}
      isDisabled={command.waitingForFile === 1}
    />
  );
};

export default DownloadScriptButton;

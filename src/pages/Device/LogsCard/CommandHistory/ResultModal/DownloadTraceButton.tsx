import * as React from 'react';
import { Download } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { DeviceCommandHistory } from 'hooks/Network/Commands';
import { useDownloadTrace } from 'hooks/Network/Trace';

type Props = {
  command?: DeviceCommandHistory;
};
const DownloadTraceButton = ({ command }: Props) => {
  const { t } = useTranslation();
  const download = useDownloadTrace({ serialNumber: command?.serialNumber ?? '', commandId: command?.UUID ?? '' });

  if (!command || command.command !== 'trace' || command.status !== 'completed' || command.errorCode !== 0) return null;

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

export default DownloadTraceButton;

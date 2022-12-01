import * as React from 'react';
import { Download } from 'phosphor-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { dateForFilename } from 'helpers/dateFormatting';
import { parseDbm } from 'helpers/stringHelper';
import { DeviceScanResult, ScanChannel, WifiScanResult } from 'models/Device';

type Props = {
  command?: WifiScanResult;
};

const DownloadWifiScanButton = ({ command }: Props) => {
  const { t } = useTranslation();

  const scanResults = React.useMemo(() => {
    if (!command) return undefined;
    try {
      const createdChannels: { [key: string]: ScanChannel } = {};
      const listCsv: DeviceScanResult[] = [];

      for (const scan of command.results.status.scan) {
        if (!createdChannels[scan.channel]) {
          const channel: ScanChannel = {
            channel: scan.channel,
            devices: [],
          };
          for (const deviceResult of command.results.status.scan) {
            if (deviceResult.channel === scan.channel) {
              let ssid = '';
              const signal: number | string = parseDbm(deviceResult.signal);
              if (deviceResult.ssid && deviceResult.ssid.length > 0) ssid = deviceResult.ssid;
              else ssid = deviceResult.meshid && deviceResult.meshid.length > 0 ? deviceResult.meshid : 'N/A';
              channel.devices.push({ ...deviceResult, ssid, signal });
              // @ts-ignore
              listCsv.push({ ...deviceResult, ssid, signal, ies: JSON.stringify(deviceResult.ies) });
            }
          }
          createdChannels[scan.channel] = channel;
        }
      }
      return listCsv;
    } catch (e) {
      return undefined;
    }
  }, [command?.results]);

  if (!scanResults || !command) return null;

  return (
    <CSVLink
      filename={`wifi_scan_${command.serialNumber}_${dateForFilename(new Date().getTime() / 1000)}.csv`}
      data={scanResults as object[]}
    >
      <ResponsiveButton
        color="gray"
        icon={<Download size={20} />}
        isCompact
        label={t('common.download')}
        onClick={() => {}}
      />
    </CSVLink>
  );
};

export default DownloadWifiScanButton;

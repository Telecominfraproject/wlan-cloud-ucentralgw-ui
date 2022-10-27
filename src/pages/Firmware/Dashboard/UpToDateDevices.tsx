import * as React from 'react';
import { FloppyDisk } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import { FirmwareDashboardResponse } from 'hooks/Network/Firmware';

type Props = {
  data: FirmwareDashboardResponse;
};
const UpToDateDevicesSimple = ({ data }: Props) => {
  const { t } = useTranslation();

  const parsedData = React.useMemo(() => {
    const usingLatest = data.usingLatest.reduce((acc, curr) => acc + curr.value, 0);
    const total = data.numberOfDevices > 0 ? data.numberOfDevices : 1;
    const avg = Math.floor((usingLatest / total) * 100);

    let color: [string, string] = ['green.300', 'green.300'];

    if (avg >= 80) {
      color = ['yellow.300', 'yellow.300'];
    } else if (avg < 80) {
      color = ['red.300', 'red.300'];
    }

    return { title: `${avg}%`, color };
  }, [data]);

  return (
    <SimpleIconStatDisplay
      title={t('controller.firmware.up_to_date')}
      value={parsedData.title}
      description={t('controller.firmware.up_to_date_explanation')}
      icon={FloppyDisk}
      color={parsedData.color}
    />
  );
};

export default UpToDateDevicesSimple;

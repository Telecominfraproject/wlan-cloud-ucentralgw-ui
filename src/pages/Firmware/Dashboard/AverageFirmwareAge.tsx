import * as React from 'react';
import { Cake } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import { FirmwareDashboardResponse } from 'hooks/Network/Firmware';

type Props = {
  data: FirmwareDashboardResponse;
};
const AverageFirmwareAge = ({ data }: Props) => {
  const { t } = useTranslation();

  const parsedData = React.useMemo(() => {
    const usingUnknown = data.unknownFirmwares.reduce((acc, curr) => acc + curr.value, 0);
    const total = data.numberOfDevices > 0 ? data.numberOfDevices : 1;
    const usingLatest = data.usingLatest.reduce((acc, curr) => acc + curr.value, 0);
    const useable = total - usingUnknown - usingLatest;
    if (useable <= 0 || !data.totalSecondsOld[0]) return '-';

    const secondsPerDevice = data.totalSecondsOld[0].value / useable;
    const days = Math.ceil(secondsPerDevice / (60 * 60 * 24));

    return `${days} ${t('common.days')}`;
  }, [data]);

  return (
    <SimpleIconStatDisplay
      title={t('controller.firmware.firmware_age')}
      value={parsedData}
      description={t('controller.firmware.firmware_age_explanation')}
      icon={Cake}
      color={['purple.300', 'purple.300']}
    />
  );
};

export default AverageFirmwareAge;

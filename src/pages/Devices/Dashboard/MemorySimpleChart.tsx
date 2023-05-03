import * as React from 'react';
import { Circuitry } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import { ControllerDashboardMemoryUsed } from 'hooks/Network/Controller';

type Props = {
  data: ControllerDashboardMemoryUsed[];
};

const MemorySimpleChart = ({ data }: Props) => {
  const { t } = useTranslation();

  const highMemoryDevices = React.useMemo(
    () =>
      data.reduce((acc, curr) => {
        if (curr.tag === '> 75%') return acc + curr.value;
        return acc;
      }, 0),
    [data],
  );

  return (
    <SimpleIconStatDisplay
      title="High Memory Devices (>90%)"
      value={highMemoryDevices}
      description={t('controller.dashboard.memory_explanation')}
      icon={Circuitry}
      color={highMemoryDevices === 0 ? ['teal.300', 'teal.300'] : ['red.300', 'red.300']}
    />
  );
};

export default MemorySimpleChart;

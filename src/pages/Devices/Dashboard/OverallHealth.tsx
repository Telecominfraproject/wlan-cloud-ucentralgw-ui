import * as React from 'react';
import { Heart, Warning } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import { ControllerDashboardHealth } from 'hooks/Network/Controller';

type Props = {
  data: ControllerDashboardHealth[];
};
const OverallHealthSimple = ({ data }: Props) => {
  const { t } = useTranslation();

  const parsedData = React.useMemo(() => {
    const totalDevices = data.reduce(
      (acc, curr) => {
        let newHealth = 0;
        if (curr.tag === '100%') newHealth = curr.value * 100;
        else if (curr.tag === '>90%') newHealth = curr.value * 95;
        else if (curr.tag === '>60%') newHealth = curr.value * 75;
        else if (curr.tag === '<60%') newHealth = curr.value * 30;

        return {
          totalDevices: acc.totalDevices + curr.value,
          totalHealth: acc.totalHealth + newHealth,
        };
      },
      {
        totalHealth: 0,
        totalDevices: 0,
      },
    );

    const avg = Math.floor(totalDevices.totalHealth / totalDevices.totalDevices);
    let color: [string, string] = ['green.300', 'green.300'];
    let icon = Heart;

    if (avg >= 80) {
      icon = Warning;
      color = ['yellow.300', 'yellow.300'];
    } else if (avg < 80) {
      icon = Warning;
      color = ['red.300', 'red.300'];
    }

    return { title: `${avg}%`, color, icon };
  }, [data]);

  return (
    <SimpleIconStatDisplay
      title={t('controller.dashboard.overall_health')}
      value={parsedData.title}
      description={t('controller.dashboard.overall_health_explanation')}
      icon={parsedData.icon}
      color={parsedData.color}
    />
  );
};

export default OverallHealthSimple;

import * as React from 'react';
import { Box, Heading, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { WifiHigh } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import WifiAnalysisAssocationsTable, { ParsedAssociation } from './AssocationsTable';
import WifiAnalysisRadioTable, { ParsedRadio } from './RadiosTable';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { compactSecondsToDetailed } from 'helpers/dateFormatting';
import { parseDbm } from 'helpers/stringHelper';
import { DeviceStatistics, useGetDeviceNewestStats, useGetMacOuis } from 'hooks/Network/Statistics';

type Props = {
  serialNumber: string;
};

const parseRadios = (_: (str: string) => string, data: { data: DeviceStatistics; recorded: number }) => {
  const radios: ParsedRadio[] = [];
  if (data.data.radios) {
    for (let i = 0; i < data.data.radios.length; i += 1) {
      const radio = data.data.radios[i];
      let temperature = radio?.temperature;
      if (temperature) temperature = temperature > 1000 ? Math.round(temperature / 1000) : temperature;

      const tempNoise = radio?.noise ?? radio?.survey?.[0]?.noise;
      const noise = tempNoise ? parseDbm(tempNoise) : '-';

      const tempActiveMs = radio?.survey?.[0]?.time ?? radio?.active_ms;
      const activeMs = tempActiveMs?.toLocaleString() ?? '-';

      const tempBusyMs = radio?.survey?.[0]?.busy ?? radio?.busy_ms;
      const busyMs = tempBusyMs?.toLocaleString() ?? '-';

      const tempReceiveMs = radio?.survey?.[0]?.time_rx ?? radio?.receive_ms;
      const receiveMs = tempReceiveMs?.toLocaleString() ?? '-';

      const tempSendMs = radio?.survey?.[0]?.time_tx;
      const sendMs = tempSendMs?.toLocaleString() ?? '-';

      if (radio) {
        radios.push({
          recorded: data.recorded,
          index: i,
          band: radio.band?.[0],
          deductedBand: radio.channel && radio.channel > 16 ? '5G' : '2G',
          channel: radio.channel,
          channelWidth: radio.channel_width,
          noise,
          txPower: radio.tx_power ?? '-',
          activeMs,
          busyMs,
          receiveMs,
          sendMs,
          phy: radio.phy,
          temperature: temperature ? temperature.toString() : '-',
          frequency: radio.frequency?.join(', ') ?? '-',
        });
      }
    }
  }
  return radios;
};

const parseAssociations = (data: { data: DeviceStatistics; recorded: number }, radios: ParsedRadio[]) => {
  const associations: ParsedAssociation[] = [];

  for (const interfaceObj of data.data.interfaces ?? []) {
    for (const ssid of interfaceObj.ssids ?? []) {
      let radio: ParsedRadio | undefined;

      if (ssid.phy) {
        const foundRadio = radios.find((r) => r.phy === ssid.phy);
        if (foundRadio) radio = foundRadio;
      }
      if (!radio) {
        const potentialIndex = ssid.radio?.$ref?.split('/').pop();
        if (potentialIndex) {
          const foundRadio = radios[parseInt(potentialIndex, 10)];
          if (foundRadio) radio = foundRadio;
        }
      }

      for (const association of ssid.associations ?? []) {
        const ips = interfaceObj.clients?.find(({ mac }) => mac === association.station);

        associations.push({
          radio,
          ips: {
            ipv4: ips?.ipv4_addresses ?? [],
            ipv6: ips?.ipv6_addresses ?? [],
          },
          station: association.station,
          ssid: ssid.ssid,
          rssi: association.rssi ? parseDbm(association.rssi) : '-',
          mode: ssid.mode,
          rxBytes: association.rx_bytes,
          rxRate: association.rx_rate.bitrate,
          rxMcs: association.rx_rate.mcs ?? '-',
          rxNss: association.rx_rate.nss ?? '-',
          txBytes: association.tx_bytes,
          txRate: association.tx_rate.bitrate,
          txMcs: association.tx_rate.mcs ?? '-',
          txNss: association.tx_rate.nss ?? '-',
          recorded: data.recorded,
          dynamicVlan: association.dynamic_vlan,
        });
      }
    }
  }
  return associations;
};

const WifiAnalysisCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [sliderIndex, setSliderIndex] = React.useState(0);
  const getStats = useGetDeviceNewestStats({ serialNumber, limit: 30 });
  const parsedData = React.useMemo(() => {
    if (!getStats.data) return undefined;

    const data: { radios: ParsedRadio[]; associations: ParsedAssociation[] }[] = [];

    for (const stats of getStats.data.data) {
      const parsedRadios = parseRadios(t, stats);
      const parsedAssocations = parseAssociations(stats, parsedRadios);
      data.push({ radios: parsedRadios, associations: parsedAssocations });
    }

    return data.reverse();
  }, [getStats.data]);

  const getOuis = useGetMacOuis({ macs: parsedData?.[sliderIndex]?.associations?.map((d) => d.station) });
  const ouiKeyValue = React.useMemo(() => {
    if (!getOuis.data) return undefined;
    const obj: Record<string, string> = {};
    for (const oui of getOuis.data.tagList) {
      obj[oui.tag] = oui.value;
    }
    return obj;
  }, [parsedData, getOuis.data]);

  const onSliderChange = (value: number) => {
    setSliderIndex(value);
  };

  React.useEffect(() => {
    if (parsedData) {
      setSliderIndex(parsedData.length - 1);
    }
  }, [parsedData]);

  return (
    <Card mb={4}>
      <CardHeader
        headerStyle={{
          color: 'teal',
        }}
        icon={<WifiHigh size={20} />}
      >
        <Heading size="md" w="180px">
          {t('controller.wifi.wifi_analysis')}
        </Heading>
      </CardHeader>
      <CardBody display="block">
        <Text>
          When:{' '}
          {parsedData && parsedData[sliderIndex]?.radios[0]?.recorded !== undefined ? (
            // @ts-ignore
            <FormattedDate date={parsedData[sliderIndex]?.radios[0]?.recorded} />
          ) : (
            '-'
          )}
        </Text>
        {parsedData && (
          <Slider
            step={1}
            value={sliderIndex}
            max={parsedData.length === 0 ? 0 : parsedData.length - 1}
            onChange={onSliderChange}
            focusThumbOnChange={false}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb zIndex={0} />
          </Slider>
        )}
        <Box />
        <Box w="100%">
          <WifiAnalysisRadioTable data={parsedData?.[sliderIndex]?.radios} />
          <WifiAnalysisAssocationsTable data={parsedData?.[sliderIndex]?.associations} ouis={ouiKeyValue} />
        </Box>
      </CardBody>
    </Card>
  );
};

export default WifiAnalysisCard;

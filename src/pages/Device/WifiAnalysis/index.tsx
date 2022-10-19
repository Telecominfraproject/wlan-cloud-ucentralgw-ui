import * as React from 'react';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { Box, Flex, Heading, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import WifiAnalysisAssocationsTable, { ParsedAssociation } from './AssocationsTable';
import WifiAnalysisRadioTable, { ParsedRadio } from './RadiosTable';
import { DeviceStatistics, useGetDeviceNewestStats, useGetMacOuis } from 'hooks/Network/Statistics';
import { parseDbm } from 'helpers/stringHelper';
import { CardBody } from 'components/Containers/Card/CardBody';
import { compactSecondsToDetailed } from 'helpers/dateFormatting';

type Props = {
  serialNumber: string;
};

const parseRadios = (t: (str: string) => string, data: { data: DeviceStatistics; recorded: number }) => {
  const radios: ParsedRadio[] = [];
  if (data.data.radios) {
    for (let i = 0; i < data.data.radios.length; i += 1) {
      const radio = data.data.radios[i];
      if (radio) {
        radios.push({
          recorded: data.recorded,
          index: i,
          channel: radio.channel,
          channelWidth: radio.channel_width,
          noise: radio.noise ? parseDbm(radio.noise) : '-',
          txPower: radio.tx_power ?? '-',
          activeMs: compactSecondsToDetailed(radio?.active_ms ? Math.floor(radio.active_ms / 1000) : 0, t),
          busyMs: compactSecondsToDetailed(radio?.busy_ms ? Math.floor(radio.busy_ms / 1000) : 0, t),
          receiveMs: compactSecondsToDetailed(radio?.receive_ms ? Math.floor(radio.receive_ms / 1000) : 0, t),
          phy: radio.phy,
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
        });
      }
    }
  }
  return associations;
};

const WifiAnalysisCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [sliderIndex, setSliderIndex] = React.useState(0);
  const getStats = useGetDeviceNewestStats({ serialNumber, limit: 20 });
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
      <CardHeader>
        <Flex w="100%">
          <Heading size="md" w="180px">
            {t('controller.wifi.wifi_analysis')}
          </Heading>
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
              <SliderThumb />
            </Slider>
          )}
        </Flex>
      </CardHeader>
      <CardBody display="block">
        <Box>
          {parsedData && parsedData[sliderIndex]?.associations[0]?.recorded !== undefined ? (
            // @ts-ignore
            <FormattedDate date={parsedData[sliderIndex]?.associations[0]?.recorded} />
          ) : (
            '-'
          )}
        </Box>
        <Box w="100%">
          <WifiAnalysisRadioTable data={parsedData?.[sliderIndex]?.radios} />
          <WifiAnalysisAssocationsTable data={parsedData?.[sliderIndex]?.associations} ouis={ouiKeyValue} />
        </Box>
      </CardBody>
    </Card>
  );
};

export default WifiAnalysisCard;

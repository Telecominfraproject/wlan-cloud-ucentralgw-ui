import * as React from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ParsedAssociation } from '../WifiAnalysis/AssocationsTable';
import { ParsedRadio } from '../WifiAnalysis/RadiosTable';
import RadiusClientModal from './Modal';
import DeviceRadiusClientsTable from './Table';
import { compactSecondsToDetailed } from 'helpers/dateFormatting';
import { parseDbm } from 'helpers/stringHelper';
import { useGetDeviceRadiusSessions } from 'hooks/Network/Radius';
import { DeviceStatistics, useGetDeviceLastStats } from 'hooks/Network/Statistics';

const parseRadios = (t: (str: string) => string, data: DeviceStatistics) => {
  const radios: ParsedRadio[] = [];
  if (data.radios) {
    for (let i = 0; i < data.radios.length; i += 1) {
      const radio = data.radios[i];
      if (radio) {
        radios.push({
          recorded: 0,
          index: i,
          band: radio.band?.[0],
          deductedBand: radio.channel && radio.channel > 16 ? '5G' : '2G',
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

const parseAssociations = (data: DeviceStatistics, radios: ParsedRadio[]) => {
  const associations: ParsedAssociation[] = [];

  for (const interfaceObj of data.interfaces ?? []) {
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
          recorded: 0,
        });
      }
    }
  }
  return associations;
};

type Props = {
  serialNumber: string;
};

const RadiusClientsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [selectedClient, setSelectedClient] = React.useState<string>('22:07:ff:11:84:6f');
  const getRadiusClients = useGetDeviceRadiusSessions({ serialNumber });
  const getStats = useGetDeviceLastStats({ serialNumber });
  const modalProps = useDisclosure();

  const wifiAnalysisData = React.useMemo(() => {
    if (!getRadiusClients.data || getRadiusClients.data.length === 0 || !getStats.data)
      return { radios: [], associations: [] };

    const data: { radios: ParsedRadio[]; associations: ParsedAssociation[] } = { radios: [], associations: [] };

    data.radios = parseRadios(t, getStats.data);
    data.associations = parseAssociations(getStats.data, data.radios).filter((a) => {
      const found = getRadiusClients.data.find(
        (c) => c.callingStationId.replaceAll('-', ':').toLowerCase() === a.station,
      );
      return !!found;
    });

    return { ...data };
  }, [getStats.dataUpdatedAt, getRadiusClients.data]);

  const onOpen = (mac: string) =>
    wifiAnalysisData.associations.find((a) => a.station === mac.replaceAll('-', ':').toLowerCase())
      ? () => {
          setSelectedClient(mac.replaceAll('-', ':').toLowerCase());
          modalProps.onOpen();
        }
      : undefined;

  if (!getRadiusClients.data || getRadiusClients.data.length === 0) return null;

  return (
    <Box mb={4}>
      <Box w="100%">
        <DeviceRadiusClientsTable
          sessions={getRadiusClients.data}
          refetch={getRadiusClients.refetch}
          isFetching={getRadiusClients.isFetching}
          onAnalysisOpen={onOpen}
        />
      </Box>
      <RadiusClientModal
        data={wifiAnalysisData}
        modalProps={modalProps}
        selectedClient={selectedClient}
        refresh={getStats.refetch}
        isFetching={getStats.isFetching}
      />
    </Box>
  );
};

export default RadiusClientsCard;

import * as React from 'react';
import { Box, Grid, GridItem, Heading, Text, UseDisclosureReturn } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ParsedAssociation } from '../WifiAnalysis/AssocationsTable';
import { ParsedRadio } from '../WifiAnalysis/RadiosTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Modal } from 'components/Modals/Modal';
import { bytesString } from 'helpers/stringHelper';
import { useGetMacOuis } from 'hooks/Network/Statistics';

type Props = {
  data: {
    radios: ParsedRadio[];
    associations: ParsedAssociation[];
  };
  modalProps: UseDisclosureReturn;
  selectedClient?: string;
  refresh: () => void;
  isFetching: boolean;
};

const RadiusClientModal = ({ data, modalProps, selectedClient, refresh, isFetching }: Props) => {
  const { t } = useTranslation();
  const getOuis = useGetMacOuis({ macs: data.associations.map((d) => d.station) });
  const ouiKeyValue = React.useMemo(() => {
    if (!getOuis.data) return undefined;
    const obj: Record<string, string> = {};
    for (const oui of getOuis.data.tagList) {
      obj[oui.tag] = oui.value;
    }
    return obj;
  }, [data.associations, getOuis.data]);

  if (!selectedClient) return null;

  const correspondingAssociation = data.associations.find((a) => a.station === selectedClient);

  const vendor = correspondingAssociation?.station ? ouiKeyValue?.[correspondingAssociation?.station] : '';

  return (
    <Modal
      title={`${selectedClient}`}
      {...modalProps}
      options={{
        modalSize: 'sm',
      }}
      topRightButtons={<RefreshButton onClick={refresh} isFetching={isFetching} />}
    >
      <Box>
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">{t('analytics.band')}</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.radio?.band}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">{t('controller.wifi.vendor')}</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{vendor && vendor.length > 0 ? vendor : t('common.unknown')}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">{t('controller.wifi.mode')}</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.mode.toUpperCase()}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">RSSI</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.rssi} db</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">{t('controller.wifi.rx_rate')}</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.rxRate.toLocaleString()}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">Rx</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.rxBytes ? bytesString(correspondingAssociation.rxBytes) : 0}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">Rx MCS</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.rxMcs}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">Rx NSS</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.rxNss}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">{t('controller.wifi.tx_rate')}</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.txRate.toLocaleString()}</Text>
          </GridItem>
          <GridItem w="100%" colSpan={1}>
            <Heading size="sm">Tx</Heading>
          </GridItem>
          <GridItem w="100%" colSpan={2}>
            <Text>{correspondingAssociation?.txBytes ? bytesString(correspondingAssociation.txBytes) : 0}</Text>
          </GridItem>
        </Grid>
      </Box>
    </Modal>
  );
};

export default RadiusClientModal;

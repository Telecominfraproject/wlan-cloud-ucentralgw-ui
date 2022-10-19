import * as React from 'react';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { Flex, Grid, GridItem, Heading, Image, Tag } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { bytesString, getRevision } from 'helpers/stringHelper';
import COUNTRY_LIST from 'constants/countryList';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { compactDate, compactSecondsToDetailed } from 'helpers/dateFormatting';
import { useGetDevice, useGetDeviceStatus } from 'hooks/Network/Devices';
import { useGetDeviceLastStats } from 'hooks/Network/Statistics';

const ICON_STYLE = { width: '24px', height: '24px', marginRight: '8px' };

type Props = {
  serialNumber: string;
};

const DeviceSummary = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const getDevice = useGetDevice({ serialNumber });
  const getStatus = useGetDeviceStatus({ serialNumber });
  const getStats = useGetDeviceLastStats({ serialNumber });

  const getMemory = () => {
    if (getStats.data?.unit?.memory) {
      const usedMemory = getStats.data.unit.memory.total - getStats.data.unit.memory.free;
      const memoryUsedPct =
        getStats.data?.unit?.memory.total > 0 ? (usedMemory / getStats.data.unit.memory.total) * 100 : 0;
      let color = 'red';
      if (memoryUsedPct < 60) color = 'green';
      else if (memoryUsedPct < 85) color = 'yellow';

      return (
        <>
          {bytesString(getStats.data.unit.memory.total)}
          <Tag colorScheme={color} ml={2} size="md">
            {Math.floor(memoryUsedPct * 100) / 100}% {t('controller.stats.used')}
          </Tag>
        </>
      );
    }

    return '-';
  };
  return (
    <Card mb={4}>
      <CardBody>
        <Flex w="100%" alignItems="center">
          <Image
            src={`devices/${getDevice.data?.compatible}.png`}
            alt={getDevice?.data?.compatible}
            boxSize="220px"
            mr={4}
          />
          <Grid templateColumns="repeat(2, 1fr)" gap={0} w="100%">
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('certificates.model')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>{getDevice.data?.compatible}</GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('commands.revision')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>{getRevision(getDevice.data?.firmware)}</GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('system.uptime')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStats.data?.unit?.uptime ? compactSecondsToDetailed(getStats.data?.unit.uptime, t) : ''}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('controller.stats.load')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStats.data?.unit?.load
                ? getStats.data?.unit.load.map((l) => `${(l * 100).toFixed(2)}%`).join(' | ')
                : ''}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('controller.devices.localtime')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStats.data?.unit?.localtime ? compactDate(getStats.data?.unit.localtime) : ''}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('common.locale')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {!getDevice.data?.locale || getDevice.data?.locale === '' ? (
                '-'
              ) : (
                <>
                  <ReactCountryFlag style={ICON_STYLE} countryCode={getDevice.data.locale} svg />
                  {COUNTRY_LIST.find(({ value }) => value === getDevice.data.locale)?.label}
                </>
              )}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('analytics.last_contact')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStatus?.data?.lastContact ? <FormattedDate date={getStatus.data.lastContact} /> : ''}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('analytics.memory')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>{getMemory()}</GridItem>
          </Grid>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default React.memo(DeviceSummary);

import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Tag,
  useColorMode,
} from '@chakra-ui/react';
import { Cloud } from '@phosphor-icons/react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import LocationDisplayButton from './LocationDisplayButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import COUNTRY_LIST from 'constants/countryList';
import { compactDate, compactSecondsToDetailed } from 'helpers/dateFormatting';
import { bytesString, getRevision, uppercaseFirstLetter } from 'helpers/stringHelper';
import { useGetDevice, useGetDeviceStatus } from 'hooks/Network/Devices';
import { useGetDeviceLastStats } from 'hooks/Network/Statistics';

const ICON_STYLE = { width: '24px', height: '24px', marginRight: '8px' };

type Props = {
  serialNumber: string;
};

const DeviceSummary = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
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

  const getDeviceCompatible = () => {
    if (!getDevice.data?.compatible) return undefined;

    if (!getDevice.data?.compatible.includes('-')) return getDevice.data?.compatible;

    const split = getDevice.data?.compatible.split('-');

    if (split[split.length - 1]?.length === 2) return split[0]?.trim();

    return getDevice.data?.compatible;
  };

  return (
    <Card mb={4}>
      <CardHeader
        headerStyle={{
          color: 'blue',
        }}
        icon={<Cloud weight="bold" size={20} />}
      >
        <Heading size="md">{t('common.status')}</Heading>
      </CardHeader>
      <CardBody>
        <Flex w="100%" alignItems="center">
          <Image
            src={`devices/${getDeviceCompatible()}.png`}
            alt={getDevice?.data?.compatible}
            fallback={
              <Box minW="220px" w="220px" h="220px" mr={4} display="flex">
                <Image
                  src="devices/generic_ap.png"
                  alt={getDevice?.data?.compatible}
                  w="220px"
                  h="220px"
                  position="absolute"
                  filter={colorMode === 'dark' ? 'invert(1)' : undefined}
                />
                <Center>
                  <Alert status="info" opacity={0.95} py={1} variant="solid">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">{t('devices.no_model_image')}</AlertDescription>
                  </Alert>
                </Center>
              </Box>
            }
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
                <Box mr={2}>
                  <ReactCountryFlag style={ICON_STYLE} countryCode={getDevice.data.locale} svg />
                  {COUNTRY_LIST.find(({ value }) => value === getDevice.data.locale)?.label}
                </Box>
              )}
              <LocationDisplayButton serialNumber={serialNumber} />
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('analytics.last_contact')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStatus?.data?.lastContact && getStatus?.data.lastContact !== 0 ? (
                <FormattedDate date={getStatus.data.lastContact} />
              ) : (
                <FormattedDate date={getDevice.data?.lastRecordedContact} />
              )}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('analytics.memory')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>{getMemory()}</GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('devices.certificate_expires_in')}:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getDevice.data?.certificateExpiryDate ? (
                <FormattedDate date={getDevice.data?.certificateExpiryDate} hidePrefix />
              ) : (
                '-'
              )}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">Connect Reason:</Heading>
            </GridItem>
            <GridItem colSpan={1}>
              {getStatus.data?.connectReason && getStatus.data?.connectReason.length > 0
                ? uppercaseFirstLetter(getStatus.data.connectReason)
                : '-'}
            </GridItem>
          </Grid>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default React.memo(DeviceSummary);

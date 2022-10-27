import * as React from 'react';
import { Button, Grid, GridItem, Heading, Link, Spacer, useClipboard, useDisclosure } from '@chakra-ui/react';
import { Eye, EyeSlash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import ViewCapabilitiesModal from './ViewCapabilitiesModal';
import ViewConfigurationModal from './ViewConfigurationModal';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { compactDate } from 'helpers/dateFormatting';
import { useGetDevice } from 'hooks/Network/Devices';
import { useGetProvUi } from 'hooks/Network/Endpoints';
import { useGetTag } from 'hooks/Network/Inventory';
import { DeviceConfiguration } from 'models/Device';

type Props = {
  serialNumber: string;
};

const DeviceDetails = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const getProvUi = useGetProvUi();
  const getDevice = useGetDevice({ serialNumber });
  const getTag = useGetTag({ serialNumber });
  const { isOpen: isShowingPassword, onToggle: onTogglePassword } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(
    getDevice.data?.devicePassword !== undefined && getDevice.data?.devicePassword !== ''
      ? getDevice.data?.devicePassword
      : 'openwifi',
  );

  const getPassword = () => {
    if (!getDevice.data) return '-';
    if (isShowingPassword) {
      return getDevice.data?.devicePassword === '' ? 'openwifi' : getDevice.data?.devicePassword;
    }
    return '••••••••••••';
  };

  const goToProvUi = (dir: string) => `${getProvUi.data}/#/${dir}`;

  return (
    <Card mb={4}>
      <CardHeader mb={2}>
        <Heading size="md">{t('common.details')}</Heading>
        <Spacer />
        <ViewCapabilitiesModal serialNumber={serialNumber} />
        <ViewConfigurationModal configuration={getDevice.data?.configuration as DeviceConfiguration} />
      </CardHeader>
      <CardBody display="block">
        <Grid templateColumns="repeat(2, 1fr)" gap={0} w="100%">
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">MAC:</Heading>
          </GridItem>
          <GridItem colSpan={1}>{getDevice.data?.macAddress}</GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('common.password')}</Heading>
          </GridItem>
          <GridItem colSpan={1}>
            <Button
              onClick={onTogglePassword}
              size="sm"
              rightIcon={isShowingPassword ? <EyeSlash /> : <Eye />}
              height={6}
            >
              {getPassword()}
            </Button>
            <Button onClick={onCopy} size="sm" ml={2} colorScheme="teal" height={6}>
              {hasCopied ? t('common.copied') : t('common.copy')}
            </Button>
          </GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('common.manufacturer')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>{getDevice.data?.manufacturer}</GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('common.type')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>{getDevice.data?.deviceType}</GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('common.created')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>
            {getDevice.data?.createdTimestamp ? compactDate(getDevice.data.createdTimestamp) : '-'}
          </GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('common.modified')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>{getDevice.data?.modified ? compactDate(getDevice.data.modified) : '-'}</GridItem>
        </Grid>
        <Heading my={2} size="md">
          {t('controller.provisioning.title')}
        </Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={0} w="100%">
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('entities.one')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>
            {getTag.data?.extendedInfo?.entity?.name ? (
              <Link isExternal href={goToProvUi(`entity/${getTag.data?.subscriber}`)}>
                {getTag.data?.extendedInfo?.entity?.name}
              </Link>
            ) : (
              '-'
            )}
          </GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('venues.one')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>
            {getTag.data?.extendedInfo?.venue?.name ? (
              <Link isExternal href={goToProvUi(`venue/${getTag.data?.venue}`)}>
                {getTag.data?.extendedInfo?.venue?.name}
              </Link>
            ) : (
              '-'
            )}
          </GridItem>
          <GridItem colSpan={1} alignContent="center" alignItems="center">
            <Heading size="sm">{t('subscribers.one')}:</Heading>
          </GridItem>
          <GridItem colSpan={1}>
            {getTag.data?.subscriber !== undefined && getTag.data?.subscriber !== '' ? (
              <Link isExternal href={goToProvUi(`subscriber/${getTag.data?.subscriber}`)}>
                {getTag.data?.extendedInfo?.subscriber?.name ?? getTag.data.subscriber}
              </Link>
            ) : (
              '-'
            )}
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

export default React.memo(DeviceDetails);

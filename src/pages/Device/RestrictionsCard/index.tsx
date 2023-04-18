import * as React from 'react';
import {
  Box,
  Flex,
  Heading,
  ListItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Tooltip,
  UnorderedList,
} from '@chakra-ui/react';
import { LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useGetDevice } from 'hooks/Network/Devices';

type Props = {
  serialNumber: string;
};

const RestrictionsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const getDevice = useGetDevice({ serialNumber });

  const LABELS = {
    dfs: t('restrictions.dfs'),
    ssh: 'SSH',
    rtty: 'RTTY',
    tty: t('restrictions.tty'),
    // developer: t('restrictions.developer'),
    upgrade: t('restrictions.signed_upgrade'),
    commands: t('restrictions.gw_commands'),
  } as { [key: string]: string };

  const restrictions = getDevice.data?.restrictionDetails;

  if (!restrictions || !getDevice.data?.restrictedDevice) return null;

  const allowed = () => {
    const allowedKeys = Object.entries(restrictions).filter(([k, v]) => v === false && LABELS[k] !== undefined);
    return allowedKeys.map(([k]) => <ListItem key={k}>{LABELS[k]}</ListItem>);
  };
  const restricted = () => {
    const restrictedKeys = Object.entries(restrictions).filter(([k, v]) => v === true && LABELS[k] !== undefined);
    return restrictedKeys.map(([k]) => <ListItem key={k}>{LABELS[k]}</ListItem>);
  };

  const isMissingSigningInfo =
    !restrictions.key_info ||
    (!restrictions.key_info.algo && !restrictions.key_info.vendor) ||
    (restrictions.key_info.algo.length === 0 && restrictions.key_info.vendor.length === 0);

  return (
    <Card mb={4}>
      <CardHeader>
        <Heading size="md" my="auto" mr={2}>
          {t('restrictions.title')}
        </Heading>
        {getDevice.data?.restrictionDetails?.developer ? (
          <Tooltip label={t('devices.restricted_overriden')} hasArrow>
            <Tag size="lg" colorScheme="green">
              <TagLeftIcon boxSize="18px" as={LockSimpleOpen} />
              <TagLabel>{t('devices.restrictions_overriden_title')}</TagLabel>
            </Tag>
          </Tooltip>
        ) : null}
      </CardHeader>
      <CardBody p={0} display="block">
        <Flex mt={2}>
          <Heading size="sm" mr={2} my="auto">
            {t('restrictions.countries')}:
          </Heading>
          <Text my="auto">
            {restrictions.country?.length === 0 ? t('common.all') : restrictions.country.join(', ')}
          </Text>
        </Flex>
        <Flex mt={2}>
          <Heading size="sm" mt={2} my="auto">
            {t('restrictions.key_verification')} {isMissingSigningInfo ? ':' : ''}
          </Heading>
          {isMissingSigningInfo ? (
            <Text my="auto" ml={2}>
              {t('common.none')}
            </Text>
          ) : null}
        </Flex>
        <UnorderedList hidden={isMissingSigningInfo}>
          <ListItem>
            {t('controller.wifi.vendor')}:{' '}
            {restrictions.key_info?.vendor?.length > 0 ? restrictions.key_info?.vendor : '-'}
          </ListItem>
          <ListItem>
            {t('restrictions.algo')}: {restrictions.key_info?.algo?.length > 0 ? restrictions.key_info?.algo : '-'}
          </ListItem>
        </UnorderedList>
        <Flex mt={2}>
          <Box w="100%">
            <Flex>
              <Heading size="sm" mr={2}>
                {t('restrictions.restricted')}
              </Heading>
              <LockSimple size={20} weight="bold" />
            </Flex>
            <UnorderedList>{restricted()}</UnorderedList>
          </Box>
          <Box w="100%">
            <Flex>
              <Heading size="sm" mr={2}>
                {t('restrictions.allowed')}
              </Heading>
              <LockSimpleOpen size={20} weight="bold" />
            </Flex>
            <UnorderedList>{allowed()}</UnorderedList>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default RestrictionsCard;

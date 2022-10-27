import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Spacer,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { MultiValue, Select } from 'chakra-react-select';
import { ArrowsClockwise } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import SystemLoggingButton from './LoggingButton';
import SystemCertificatesTable from './SystemCertificatesTable';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { compactSecondsToDetailed } from 'helpers/dateFormatting';
import { EndpointApiResponse } from 'hooks/Network/Endpoints';
import { useGetSubsystems, useGetSystemInfo, useReloadSubsystems } from 'hooks/Network/System';

interface Props {
  endpoint: EndpointApiResponse;
  token: string;
}

const SystemTile = ({ endpoint, token }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subs, setSubs] = useState<{ value: string; label: string }[]>([]);
  const {
    data: system,
    refetch: refreshSystem,
    isFetching: isFetchingSystem,
  } = useGetSystemInfo({ endpoint: endpoint.uri, name: endpoint.type, token });
  const {
    data: subsystems,
    refetch: refreshSubsystems,
    isFetching: isFetchingSubsystems,
  } = useGetSubsystems({ enabled: true, endpoint: endpoint.uri, name: endpoint.type, token });
  const resetSubs = () => setSubs([]);
  const { mutateAsync: reloadSubsystems, isLoading: isReloading } = useReloadSubsystems({
    endpoint: endpoint.uri,
    resetSubs,
    token,
  });

  const handleReloadClick = () => {
    reloadSubsystems(subs.map((sub) => sub.value));
  };

  const refresh = () => {
    refreshSystem();
    refreshSubsystems();
  };

  return (
    <>
      <Card>
        <Box display="flex" mb={2}>
          <Heading pt={0}>{endpoint.type}</Heading>
          <Spacer />
          <SystemLoggingButton endpoint={endpoint} token={token} />
          <Button
            mt={1}
            minWidth="112px"
            colorScheme="gray"
            rightIcon={<ArrowsClockwise />}
            onClick={refresh}
            isLoading={isFetchingSystem || isFetchingSubsystems}
          >
            {t('common.refresh')}
          </Button>
        </Box>
        <CardBody>
          <VStack w="100%">
            <SimpleGrid minChildWidth="500px" w="100%">
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.endpoint')}:
                </Heading>
                {endpoint.uri}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.hostname')}:
                </Heading>
                {system?.hostname}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.os')}:
                </Heading>
                {system?.os}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.processors')}:
                </Heading>
                {system?.processors}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.start')}:
                </Heading>
                {system?.start ? <FormattedDate date={system?.start} /> : '-'}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.uptime')}:
                </Heading>
                {system?.uptime ? compactSecondsToDetailed(system.uptime, t) : '-'}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('system.version')}:
                </Heading>
                {system?.version}
              </Flex>
              <Flex>
                <Heading size="sm" w="150px" my="auto">
                  {t('certificates.title')}:
                </Heading>
                {system?.certificates && system.certificates?.length > 0 ? (
                  <Button variant="link" onClick={onOpen} p={0} m={0} maxH={7}>
                    {t('common.details')} {system.certificates.length}
                  </Button>
                ) : (
                  t('common.unknown')
                )}
              </Flex>
            </SimpleGrid>
            <Flex w="100%">
              <Heading size="sm" w="150px" my="auto">
                {t('system.subsystems')}:
              </Heading>
              <Box w="400px">
                <Select
                  chakraStyles={{
                    control: (provided) => ({
                      ...provided,
                      borderRadius: '15px',
                    }),
                    dropdownIndicator: (provided) => ({
                      ...provided,
                      backgroundColor: 'unset',
                      border: 'unset',
                    }),
                  }}
                  isMulti
                  closeMenuOnSelect={false}
                  options={
                    subsystems && subsystems?.length > 0 ? subsystems.map((sys) => ({ value: sys, label: sys })) : []
                  }
                  onChange={
                    setSubs as (
                      newValue: MultiValue<{
                        value: string;
                        label: string;
                      }>,
                    ) => void
                  }
                  value={subs}
                  placeholder={t('system.systems_to_reload')}
                />
              </Box>
              <Tooltip hasArrow label={t('system.reload_chosen_subsystems')}>
                <IconButton
                  aria-label="Reload subsystems"
                  ml={2}
                  onClick={handleReloadClick}
                  icon={<ArrowsClockwise size={20} />}
                  colorScheme="gray"
                  isLoading={isReloading}
                  isDisabled={subs.length === 0}
                />
              </Tooltip>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      <AlertDialog leastDestructiveRef={undefined} isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('certificates.title')}</AlertDialogHeader>
            <AlertDialogBody pb={6}>
              <SystemCertificatesTable certificates={system?.certificates} />
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default SystemTile;

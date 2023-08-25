/* eslint-disable prefer-promise-reject-errors */
import * as React from 'react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Flex,
  Heading,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { compactDate } from 'helpers/dateFormatting';
import { getRevision } from 'helpers/stringHelper';
import { DefaultFirmware } from 'hooks/Network/DefaultFirmware';
import { getAllAvailableFirmware } from 'hooks/Network/Firmware';

const getDefaultFirmware = async (deviceType: string, revision: string) =>
  getAllAvailableFirmware(deviceType)
    .then((res) => {
      const found = res.firmwares.find((firmware) => firmware.revision === revision);
      if (!found) {
        return { error: { deviceType, error: 'Could not find available firmware for this revision' } };
      }
      return {
        success: {
          deviceType,
          description: '',
          revision,
          imageCreationDate: found.imageDate,
          uri: found.uri,
          created: 0,
          lastModified: 0,
        },
      };
    })
    .catch(() => ({ error: { deviceType, error: 'Could not fetch firmware available for this device type' } }));

const getComputedData = async (deviceTypes: string[], revision: string) => {
  const defaultFirmwares: DefaultFirmware[] = [];
  const errors: { deviceType: string; error: string }[] = [];

  const promises = deviceTypes.map((deviceType) => getDefaultFirmware(deviceType, revision));
  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        errors.push(result.value.error);
      } else if (result.value.success) {
        defaultFirmwares.push(result.value.success);
      }
    }
  });

  return { defaultFirmwares, errors };
};

type Props = {
  deviceTypes: string[];
  revision: string;
  goNext: (defaultFirmwares: DefaultFirmware[]) => Promise<void>;
  setNextCallback: React.Dispatch<React.SetStateAction<(() => (Promise<void> | void) | undefined) | undefined>>;
};

const ConfirmDefaultFirmwareCreation = ({ deviceTypes, revision, goNext, setNextCallback }: Props) => {
  const { t } = useTranslation();
  const getCompleteData = useQuery(
    ['default_firmware', 'computed_data'],
    () => getComputedData(deviceTypes, revision),
    {
      refetchOnMount: true,
    },
  );

  const onNext = async () => {
    if (getCompleteData.data) {
      await goNext(getCompleteData.data.defaultFirmwares);
    }
  };

  React.useEffect(() => {
    if (getCompleteData.data) {
      setNextCallback(() => onNext);
    } else {
      setNextCallback(undefined);
    }
  }, [getCompleteData.data, setNextCallback]);

  return (
    <>
      <Heading mb={4} size="sm">
        {t('firmware.confirm_default_data')}
      </Heading>
      {getCompleteData.isFetching ? (
        <Center my={4} display="flex" flexDirection="column">
          <Spinner size="xl" />
          <Heading size="sm" mt={2}>
            {t('firmware.fetching_defaults')}
          </Heading>
        </Center>
      ) : null}
      {getCompleteData.data && !getCompleteData.isFetching ? (
        <>
          <Heading size="sm" mb={2}>
            {t('firmware.one')}: {getRevision(revision)}
          </Heading>
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <CheckCircleIcon color="green.500" mr={2} mt={-0.5} />
                    {t('firmware.default_found', { count: getCompleteData.data?.defaultFirmwares.length })}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Accordion allowToggle allowMultiple>
                  {getCompleteData.data?.defaultFirmwares.map((data) => (
                    <AccordionItem key={data.deviceType}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            {data.deviceType}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Flex>
                          <Text>Image Date: </Text>
                          <Text ml={2}>{compactDate(data.imageCreationDate)}</Text>
                        </Flex>
                        <Flex>
                          <Text>URI: </Text>
                          <Text ml={2}>{data.uri}</Text>
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <WarningIcon color="red.500" mr={2} mt={-0.5} />
                    {t('firmware.default_not_found', { count: getCompleteData.data?.errors.length })} (cannot create
                    valid default firmware)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Accordion allowToggle allowMultiple>
                  {getCompleteData.data?.errors.map((error) => (
                    <AccordionItem key={error.deviceType}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            {error.deviceType}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>{error.error}</AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      ) : null}
    </>
  );
};

export default ConfirmDefaultFirmwareCreation;

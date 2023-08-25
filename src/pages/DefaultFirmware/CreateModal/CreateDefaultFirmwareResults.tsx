import * as React from 'react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CreateDefaultFirmwareResult } from './utils';

type Props = {
  results: CreateDefaultFirmwareResult[];
};

const CreateDefaultFirmwareResults = ({ results }: Props) => {
  const { t } = useTranslation();

  const successes = results.filter((result) => !result.error);
  const errors = results.filter((result) => result.error);

  return (
    <>
      <Heading size="sm">{t('controller.devices.results')}: </Heading>
      <Accordion allowToggle allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <CheckCircleIcon color="green.500" mr={2} mt={-0.5} />
                {t('firmware.default_created', { count: successes.length })}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <List>
              {successes.map((success) => (
                <ListItem key={success.deviceType}>
                  <Text>{success.deviceType}</Text>
                </ListItem>
              ))}
            </List>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <WarningIcon color="red.500" mr={2} mt={-0.5} />
                {t('firmware.default_created_error_other', { count: errors.length })}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <List>
              {errors.map((error) => (
                <ListItem key={error.deviceType}>
                  <Flex>
                    <Text>{error.deviceType} -</Text>
                    <Text ml={2}>{error.error}</Text>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default CreateDefaultFirmwareResults;

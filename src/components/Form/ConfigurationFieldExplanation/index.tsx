import React, { useMemo } from 'react';
import { InfoIcon } from '@chakra-ui/icons';
import { Tooltip } from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthProvider';

const findDefinition = (
  definitionKey?: string,
  CONFIGURATION_DESCRIPTIONS?: {
    [key: string]: { properties: { [key: string]: { description: string } } };
  },
) => {
  if (!definitionKey || !CONFIGURATION_DESCRIPTIONS) return null;
  const split = definitionKey.split('.');
  const { length } = split;
  if (length < 2) return null;
  const start = split.slice(0, length - 1);
  const end = split[length - 1];
  return CONFIGURATION_DESCRIPTIONS[start.slice(0, length - 1).join('.')]?.properties[end ?? '']?.description ?? null;
};

export interface ConfigurationFieldExplanationProps {
  definitionKey?: string;
}
const _ConfigurationFieldExplanation: React.FC<ConfigurationFieldExplanationProps> = ({ definitionKey }) => {
  const { configurationDescriptions } = useAuth();
  const definition = useMemo(
    () =>
      findDefinition(
        definitionKey,
        configurationDescriptions as {
          [key: string]: { properties: { [key: string]: { description: string } } };
        },
      ),
    [configurationDescriptions],
  );
  if (!definition) return null;

  return (
    <Tooltip hasArrow label={definition}>
      <InfoIcon ml={2} mb="2px" />
    </Tooltip>
  );
};

export const ConfigurationFieldExplanation = React.memo(_ConfigurationFieldExplanation);

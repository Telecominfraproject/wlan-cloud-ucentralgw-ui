import * as React from 'react';
import { Box, Code, Flex, Heading, Tag, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useGetAllDeviceScripts } from 'hooks/Network/Scripts';

type Props = {
  id: string;
};

const ScriptLockedView = ({ id }: Props) => {
  const { t } = useTranslation();
  const getScripts = useGetAllDeviceScripts();

  const script = getScripts?.data?.find((curr) => curr.id === id);

  if (!script) return null;

  return (
    <Box>
      <Flex>
        <Heading size="md" my="auto">
          {script.name}
        </Heading>
        <Tag colorScheme="teal" size="lg" my="auto" mx={2}>
          {script.type}
        </Tag>
      </Flex>
      <Text fontStyle="italic" mt={2}>
        {script.description}
      </Text>
      <Text mt={2}>
        {t('common.by')}: <b>{script.author}</b>
      </Text>
      <Code whiteSpace="pre-line" w="100%" mt={2}>
        {script.content.replace(/^\n/, '')}
      </Code>
    </Box>
  );
};

export default ScriptLockedView;

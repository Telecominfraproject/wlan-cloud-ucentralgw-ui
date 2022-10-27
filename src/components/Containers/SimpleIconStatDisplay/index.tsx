import * as React from 'react';
import { As, Flex, Heading, Icon, Spacer, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Info } from 'phosphor-react';
import { Card } from '../Card';

type Props = {
  title: string;
  description: string;
  icon: As<object>;
  value: string | number | React.ReactNode;
  color: [string, string];
};

const SimpleIconStatDisplay = ({ title, description, icon, value, color }: Props) => {
  const bgColor = useColorModeValue(color[0], color[1]);

  return (
    <Card variant="widget" w="100%" p={3}>
      <Flex h="70px" w="100%">
        <Flex direction="column" justifyContent="center">
          <Heading size="lg">{value}</Heading>
          <Heading size="sm" display="flex">
            <Text opacity={0.8}>{title}</Text>
            <Tooltip label={description} hasArrow>
              <Info style={{ marginLeft: '4px', marginTop: '2px' }} />
            </Tooltip>
          </Heading>
        </Flex>
        <Spacer />
        <Icon borderRadius="15px" my="auto" as={icon} boxSize="70px" bgColor={bgColor} color="white" />
      </Flex>
    </Card>
  );
};

export default SimpleIconStatDisplay;

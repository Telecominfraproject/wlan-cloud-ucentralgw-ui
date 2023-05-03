import * as React from 'react';
import { As, Flex, Heading, Icon, Spacer, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Info } from '@phosphor-icons/react';
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
    <Card p={3} bgColor={bgColor}>
      <Flex h="70px" w="100%" color="white">
        <Flex direction="column" justifyContent="center">
          <Heading size="lg">{value}</Heading>
          <Heading size="sm" display="flex">
            <Text>{title}</Text>
            <Tooltip label={description} hasArrow>
              <Info style={{ marginLeft: '4px', marginTop: '2px' }} />
            </Tooltip>
          </Heading>
        </Flex>
        <Spacer />
        <Icon borderRadius="15px" my="auto" as={icon} boxSize="70px" color="white" />
      </Flex>
    </Card>
  );
};

export default SimpleIconStatDisplay;

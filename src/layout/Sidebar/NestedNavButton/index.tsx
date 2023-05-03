import * as React from 'react';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SubNavigationButton from './SubNavigationButton';
import IconBox from 'components/Containers/IconBox';
import { RouteGroup } from 'models/Routes';

const variantChange = '0.2s linear';

type Props = {
  isActive: (path: string) => boolean;
  route: RouteGroup;
};

const NestedNavButton = ({ isActive, route }: Props) => {
  const { t } = useTranslation();
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.200');
  const hoverBg = useColorModeValue('blue.100', 'blue.800');

  return (
    <AccordionItem w="152px" borderTop="0px" borderBottom="0px">
      <AccordionButton
        px={1}
        h={{
          md: '40px',
          lg: '50px',
        }}
        _hover={{
          bg: hoverBg,
        }}
        borderRadius="15px"
        w="100%"
      >
        <Flex alignItems="center" w="100%">
          <IconBox color="blue.300" h="30px" w="30px" me="6px" transition={variantChange} fontWeight="bold">
            {route.icon(false)}
          </IconBox>
          <Text size="md" fontWeight="bold" color={inactiveTextColor}>
            {typeof route.name === 'string' ? t(route.name) : route.name(t)}
          </Text>
        </Flex>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pl="18px" paddingEnd={0} pr="-18px">
        <Box pl={1} pr={-1} borderLeft="1px solid #63b3ed">
          {route.children.map((subRoute) => (
            <SubNavigationButton key={subRoute.path} route={subRoute} isActive={isActive} />
          ))}
        </Box>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default NestedNavButton;

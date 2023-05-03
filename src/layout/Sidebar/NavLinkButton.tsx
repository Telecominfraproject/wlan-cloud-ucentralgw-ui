import React from 'react';
import { AccordionButton, AccordionItem, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconBox from 'components/Containers/IconBox';
import { SingleRoute } from 'models/Routes';

const variantChange = '0.2s linear';

type Props = {
  isActive: boolean;
  route: SingleRoute;
  toggleSidebar: () => void;
};

export const NavLinkButton = ({ isActive, route, toggleSidebar }: Props) => {
  const { t } = useTranslation();
  const activeTextColor = useColorModeValue('gray.700', 'white');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.200');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('blue.100', 'blue.800');

  if (route.navButton) {
    return route.navButton(isActive, toggleSidebar, route) as JSX.Element;
  }

  return (
    <NavLink to={route.path.replace(':id', '0')} style={{ width: '100%' }}>
      {isActive ? (
        <AccordionItem w="152px" borderTop="0px" borderBottom="0px">
          <AccordionButton
            px={1}
            h={{
              md: '40px',
              lg: '50px',
            }}
            borderRadius="15px"
            w="100%"
            bg={activeBg}
            _hover={{
              bg: hoverBg,
            }}
          >
            <Flex alignItems="center" w="100%">
              <IconBox color="blue.300" h="30px" w="30px" me="6px" transition={variantChange} fontWeight="bold">
                {route.icon(false)}
              </IconBox>
              <Text color={activeTextColor} fontSize="md" fontWeight="bold">
                {t(route.name)}
              </Text>
            </Flex>
          </AccordionButton>
        </AccordionItem>
      ) : (
        <AccordionItem w="152px" borderTop="0px" borderBottom="0px">
          <AccordionButton
            px={1}
            h={{
              md: '40px',
              lg: '50px',
            }}
            borderRadius="15px"
            w="100%"
            _hover={{
              bg: hoverBg,
            }}
          >
            <Flex alignItems="center" w="100%">
              <IconBox color="blue.300" h="30px" w="30px" me="6px" transition={variantChange} fontWeight="bold">
                {route.icon(false)}
              </IconBox>
              <Text color={inactiveTextColor} fontSize="md" fontWeight="bold">
                {t(route.name)}
              </Text>
            </Flex>
          </AccordionButton>
        </AccordionItem>
      )}
    </NavLink>
  );
};

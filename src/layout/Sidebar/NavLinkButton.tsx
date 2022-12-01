import React from 'react';
import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import IconBox from 'components/Containers/IconBox';
import { Route } from 'models/Routes';

const variantChange = '0.2s linear';

const commonStyle = {
  boxSize: 'initial',
  justifyContent: 'flex-start',
  alignItems: 'center',
  transition: variantChange,
  bg: 'transparent',
  ps: '6px',
  py: '12px',
  pe: '4px',
  w: '100%',
  borderRadius: '15px',
  _active: {
    bg: 'inherit',
    transform: 'none',
    borderColor: 'transparent',
  },
  _focus: {
    boxShadow: '0px 7px 11px rgba(0, 0, 0, 0.04)',
  },
} as const;

type Props = {
  isActive: boolean;
  route: Route;
  toggleSidebar: () => void;
};

export const NavLinkButton = ({ isActive, route, toggleSidebar }: Props) => {
  const { t } = useTranslation();
  const activeTextColor = useColorModeValue('gray.700', 'white');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.200');
  const inactiveIconColor = useColorModeValue('gray.100', 'gray.600');

  if (route.navButton) {
    return route.navButton(isActive, toggleSidebar, route) as JSX.Element;
  }

  return (
    <NavLink to={route.path.replace(':id', '0')} key={uuid()} style={{ width: '100%' }}>
      {isActive ? (
        <Button {...commonStyle} boxShadow="none">
          <Flex>
            <IconBox bg="blue.300" color="white" h="38px" w="38px" me="6px" transition={variantChange}>
              {route.icon(true)}
            </IconBox>
            <Text color={activeTextColor} my="auto" fontSize="md">
              {t(route.name)}
            </Text>
          </Flex>
        </Button>
      ) : (
        <Button
          {...commonStyle}
          ps="6px"
          _focus={{
            boxShadow: 'none',
          }}
        >
          <Flex>
            <IconBox bg={inactiveIconColor} color="blue.300" h="34px" w="34px" me="6px" transition={variantChange}>
              {route.icon(false)}
            </IconBox>
            <Text color={inactiveTextColor} my="auto" fontSize="sm">
              {t(route.name)}
            </Text>
          </Flex>
        </Button>
      )}
    </NavLink>
  );
};

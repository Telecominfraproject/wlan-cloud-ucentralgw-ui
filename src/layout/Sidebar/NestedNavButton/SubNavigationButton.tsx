import * as React from 'react';
import { Button, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { SubRoute } from 'models/Routes';

type Props = {
  isActive: (path: string) => boolean;
  route: SubRoute;
};

const SubNavigationButton = ({ isActive, route }: Props) => {
  const { t } = useTranslation();
  const activeTextColor = useColorModeValue('gray.700', 'white');
  const inactiveTextColor = useColorModeValue('gray.600', 'gray.200');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('blue.100', 'blue.800');

  const isCurrentlyActive = isActive(route.path);

  return (
    <NavLink to={route.path.replace(':id', '0')} style={{ width: '100%' }}>
      <Button
        w="100%"
        justifyContent="left"
        color={isCurrentlyActive ? activeTextColor : inactiveTextColor}
        bg={isCurrentlyActive ? activeBg : 'transparent'}
        _hover={{
          bg: hoverBg,
        }}
        border="none"
      >
        {t(route.name)}
      </Button>
    </NavLink>
  );
};

export default SubNavigationButton;

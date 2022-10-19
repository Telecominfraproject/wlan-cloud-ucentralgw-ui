import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useColorModeValue,
  useColorMode,
  Text,
  Spacer,
  useBreakpoint,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import createLinks from './CreateLinks';
import SidebarDevices from './Devices';
import darkLogo from 'assets/Logo_Dark_Mode.svg';
import lightLogo from 'assets/Logo_Light_Mode.svg';
import { useAuth } from 'contexts/AuthProvider';
import { Route } from 'models/Routes';

const variantChange = '0.2s linear';

interface Props {
  routes: Route[];
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar = ({ routes, isOpen, toggle }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const { colorMode } = useColorMode();
  const navbarShadow = useColorModeValue('0px 7px 23px rgba(0, 0, 0, 0.05)', 'none');
  const breakpoint = useBreakpoint();

  const activeRoute = (routeName: string, otherRoute: string | undefined) => {
    if (otherRoute)
      return location.pathname.split('/')[1] === routeName.split('/')[1] ||
        location.pathname.split('/')[1] === otherRoute.split('/')[1]
        ? 'active'
        : '';

    return location.pathname === routeName ? 'active' : '';
  };

  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';

  const brand = (
    <Box pt="25px" mb="12px">
      <img
        src={colorMode === 'light' ? lightLogo : darkLogo}
        alt="OpenWifi"
        width="180px"
        height="100px"
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </Box>
  );

  return (
    <>
      <Drawer isOpen={isCompact && isOpen} onClose={toggle} placement="left">
        <DrawerOverlay />
        <DrawerContent
          w="200px"
          maxW="200px"
          ms={{
            base: '16px',
          }}
          my={{
            base: '16px',
          }}
          borderRadius="16px"
        >
          <DrawerCloseButton />
          <DrawerBody w="200px" px={0}>
            <Box maxW="200px" h="90vh">
              <Box>{brand}</Box>
              <Flex direction="column" mb="40px" h="calc(100vh - 200px)" alignItems="center" overflowY="auto">
                <Box>{createLinks(routes, activeRoute, user?.userRole ?? '')}</Box>
                <Spacer />
                <Box mb={2}>
                  <SidebarDevices />
                </Box>
                <Box>
                  <Text color="gray.400">
                    {t('footer.version')} {__APP_VERSION__}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Box>
        <Box hidden={isCompact} position="fixed">
          <Box
            shadow={navbarShadow}
            bg={useColorModeValue('white', 'gray.700')}
            transition={variantChange}
            w="200px"
            maxW="200px"
            ms="14px"
            h="calc(100vh - 32px)"
            mt="16px"
            ml="16px"
            borderRadius="16px"
          >
            <Box>{brand}</Box>
            <Flex direction="column" h="calc(100vh - 160px)" alignItems="center" overflowY="auto">
              <Box>{createLinks(routes, activeRoute, user?.userRole ?? '')}</Box>
              <Spacer />
              <Box mb={2}>
                <SidebarDevices />
              </Box>
              <Box>
                <Text color="gray.400">
                  {t('footer.version')} {__APP_VERSION__}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;

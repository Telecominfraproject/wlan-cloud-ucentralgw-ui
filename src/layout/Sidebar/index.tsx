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
  Text,
  Spacer,
  useBreakpoint,
  VStack,
  Accordion,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { NavLinkButton } from './NavLinkButton';
import NestedNavButton from './NestedNavButton';
import { useAuth } from 'contexts/AuthProvider';
import { Route } from 'models/Routes';

const variantChange = '0.2s linear';

export type SidebarProps = {
  routes: Route[];
  isOpen: boolean;
  toggle: () => void;
  logo: React.ReactNode;
  version: string;
  children?: React.ReactNode;
  topNav?: (isRouteActive: (str: string, str2: string) => boolean, toggleSidebar: () => void) => React.ReactNode;
};

export const Sidebar = ({ routes, isOpen, toggle, logo, version, topNav, children }: SidebarProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navbarShadow = useColorModeValue('0px 7px 23px rgba(0, 0, 0, 0.05)', 'none');
  const breakpoint = useBreakpoint();

  const isRouteActive = (routeName: string, otherRoute?: string) => {
    if (otherRoute)
      return (
        location.pathname.split('/')[1] === routeName.split('/')[1] ||
        location.pathname.split('/')[1] === otherRoute.split('/')[1]
      );

    return location.pathname === routeName.replace(':id', '0');
  };

  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';

  const brand = (
    <Box pt="25px" mb="15px" px="12px">
      {logo}
    </Box>
  );

  const sidebarContent = React.useMemo(
    () => (
      <>
        <Accordion allowToggle>
          <VStack spacing={2} alignItems="start" w="100%" px={4}>
            {topNav ? topNav(isRouteActive, toggle) : null}
            {routes
              .filter(({ hidden, authorized }) => !hidden && authorized.includes(user?.userRole ?? ''))
              .map((route) =>
                route.children ? (
                  <NestedNavButton key={route.id} isActive={isRouteActive} route={route} />
                ) : (
                  <NavLinkButton
                    key={route.id}
                    isActive={isRouteActive(route.path)}
                    route={route}
                    toggleSidebar={toggle}
                  />
                ),
              )}
          </VStack>
        </Accordion>
        <Spacer />
        <Box mb={2}>{children}</Box>
        <Box>
          <Text color="gray.400">
            {t('footer.version')} {version}
          </Text>
        </Box>
      </>
    ),
    [user?.userRole, location, topNav],
  );

  return (
    <>
      <Drawer isOpen={isCompact && isOpen} onClose={toggle} placement="left">
        <DrawerOverlay />
        <DrawerContent
          w="250px"
          maxW="250px"
          ms={{
            base: '16px',
          }}
          my={{
            base: '16px',
          }}
          borderRadius="16px"
        >
          <DrawerCloseButton />
          <DrawerBody maxW="250px" px="1rem">
            <Box maxW="100%" h="90vh">
              {brand}
              <Flex direction="column" mb="40px" h="calc(100vh - 200px)" alignItems="center" overflowY="auto">
                {sidebarContent}
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
            h="calc(100vh - 32px)"
            my="16px"
            ml="16px"
            borderRadius="15px"
            border="0.5px solid"
          >
            {brand}
            <Flex direction="column" h="calc(100vh - 160px)" alignItems="center" overflowY="auto">
              {sidebarContent}
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

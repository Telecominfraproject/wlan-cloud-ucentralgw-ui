import React, { useState } from 'react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  Avatar,
  MenuItem,
  MenuList,
  Heading,
  HStack,
  Text,
  IconButton,
  Tooltip,
  useBreakpoint,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowCircleLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthProvider';

export type NavbarProps = {
  toggleSidebar: () => void;
  activeRoute?: string;
  languageSwitcher?: React.ReactNode;
  favoritesButton?: React.ReactNode;
  rightElements?: React.ReactNode;
};

export const Navbar = ({
  toggleSidebar,
  activeRoute,
  languageSwitcher,
  favoritesButton,
  rightElements = null,
}: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuProps = useDisclosure();
  const [scrolled, setScrolled] = useState(false);
  const breakpoint = useBreakpoint();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user, avatar } = useAuth();

  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';

  const boxShadow = useColorModeValue('0px 7px 23px rgba(0, 0, 0, 0.05)', 'none');
  const bg = useColorModeValue(
    'linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)',
    'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)',
  );
  const borderColor = useColorModeValue('#FFFFFF', 'rgba(255, 255, 255, 0.31)');
  const filter = useColorModeValue('none', 'drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))');
  const scrollDependentStyles = scrolled
    ? ({
        position: 'fixed',
        boxShadow,
        bg,
        borderColor,
        filter,
      } as const)
    : ({
        position: 'absolute',
        filter: 'none',
        boxShadow: 'none',
        bg: 'none',
        borderColor: 'transparent',
      } as const);

  const goBack = () => navigate(-1);

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  const goToProfile = () => navigate('/account');

  window.addEventListener('scroll', changeNavbar);

  let timeout: NodeJS.Timeout;
  const onMouseEnter = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    menuProps.onOpen();
  };
  const onMouseLeave = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => menuProps.onClose(), 100);
  };

  return (
    <Portal>
      <Flex
        {...scrollDependentStyles}
        backdropFilter="blur(21px)"
        borderWidth="1.5px"
        borderStyle="solid"
        transitionDelay="0s, 0s, 0s, 0s"
        transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
        transition-property="box-shadow, background-color, filter, border"
        transitionTimingFunction="linear, linear, linear, linear"
        alignItems="center"
        borderRadius="15px"
        minH="75px"
        justifyContent="center"
        lineHeight="25.6px"
        pb="8px"
        right={{ base: '0px', sm: '0px', lg: '20px' }}
        ps="12px"
        pt="8px"
        top="15px"
        border={scrolled ? '0.5px solid' : undefined}
        w={isCompact ? '100%' : 'calc(100% - 254px)'}
        zIndex={10}
      >
        <Flex
          w="100%"
          flexDirection="row"
          alignItems="center"
          justifyItems="center"
          alignContent="center"
          justifyContent="center"
        >
          {isCompact && <HamburgerIcon w="24px" h="24px" onClick={toggleSidebar} mr={10} mt={1} />}
          {activeRoute && activeRoute.length > 0 ? (
            <Heading size="lg" mr={4}>
              {activeRoute}
            </Heading>
          ) : null}
          <Tooltip label={t('common.go_back')}>
            <IconButton
              mt={1}
              colorScheme="blue"
              aria-label={t('common.go_back')}
              onClick={goBack}
              size="sm"
              icon={<ArrowCircleLeft width={20} height={20} />}
            />
          </Tooltip>
          <Box ms="auto" w={{ base: 'unset' }}>
            <Flex alignItems="center" flexDirection="row">
              {rightElements}
              {favoritesButton}
              <Tooltip hasArrow label={t('common.theme')}>
                <IconButton
                  aria-label={t('common.theme')}
                  variant="ghost"
                  icon={colorMode === 'light' ? <MoonIcon h="20px" w="20px" /> : <SunIcon h="20px" w="20px" />}
                  onClick={toggleColorMode}
                />
              </Tooltip>
              {languageSwitcher}
              <Box ml={1} mr={4}>
                <Menu {...menuProps} gutter={0}>
                  <MenuButton
                    py={2}
                    transition="all 0.3s"
                    _focus={{ boxShadow: 'none' }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <HStack>
                      {!isCompact && <Text fontWeight="bold">{user?.name}</Text>}
                      <Avatar h="40px" w="40px" fontSize="0.8rem" lineHeight="2rem" src={avatar} name={user?.name} />
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg={useColorModeValue('white', 'gray.900')}
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <MenuItem onClick={goToProfile} w="100%">
                      {t('account.title')}
                    </MenuItem>
                    <MenuItem onClick={logout}>{t('common.logout')}</MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Portal>
  );
};

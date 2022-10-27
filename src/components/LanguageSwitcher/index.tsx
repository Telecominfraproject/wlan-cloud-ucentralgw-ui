import React, { useMemo } from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

const iconStyle = { width: '24px', height: '24px', borderRadius: '20px' };

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => () => i18n.changeLanguage(language);

  const languageIcon = useMemo(() => {
    switch (i18n.language) {
      case 'de':
        return <ReactCountryFlag style={iconStyle} countryCode="DE" svg />;
      case 'es':
        return <ReactCountryFlag style={iconStyle} countryCode="ES" svg />;
      case 'en':
        return (
          <ReactCountryFlag style={{ width: '24px', height: '24px', borderRadius: '10px' }} countryCode="GB" svg />
        );
      case 'fr':
        return <ReactCountryFlag style={iconStyle} countryCode="FR" svg />;
      case 'pt':
        return <ReactCountryFlag style={iconStyle} countryCode="BR" svg />;
      default:
        return <ReactCountryFlag style={iconStyle} countryCode="GB" svg />;
    }
  }, [i18n.language]);

  return (
    <Menu>
      <Tooltip label={t('common.language')}>
        <MenuButton background="transparent" as={IconButton} aria-label="Commands" icon={languageIcon} size="sm" />
      </Tooltip>
      <MenuList>
        <MenuItem onClick={changeLanguage('de')}>Deutsche</MenuItem>
        <MenuItem onClick={changeLanguage('es')}>Español</MenuItem>
        <MenuItem onClick={changeLanguage('en')}>English</MenuItem>
        <MenuItem onClick={changeLanguage('fr')}>Français</MenuItem>
        <MenuItem onClick={changeLanguage('pt')}>Portugues</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSelect } from '@coreui/react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <CSelect
      custom
      defaultValue={i18n.language.split('-')[0]}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="de">Deutsche</option>
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="pt">Portugues</option>
    </CSelect>
  );
};

export default LanguageSwitcher;

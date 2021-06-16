import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="select">
      <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
        <option value="de">Deutsche</option>
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="pt">Portugues</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CButton, CSpinner, CModalFooter } from '@coreui/react';

const ConfirmFooter = ({ isShown, isLoading, action, color, variant, block, toggleParent }) => {
  const { t } = useTranslation();
  const [askingIfSure, setAskingIfSure] = useState(false);

  const confirmingIfSure = () => {
    setAskingIfSure(true);
  };

  useEffect(() => {
    setAskingIfSure(false);
  }, [isShown]);

  return (
    <CModalFooter>
      <div hidden={!askingIfSure}>{t('common.are_you_sure')}</div>
      <CButton
        disabled={isLoading}
        hidden={askingIfSure}
        color={color}
        variant={variant}
        onClick={() => confirmingIfSure()}
        block={block}
      >
        {t('common.submit')}
      </CButton>
      <CButton
        disabled={isLoading}
        hidden={!askingIfSure}
        color={color}
        onClick={() => action()}
        block={block}
      >
        {isLoading ? t('common.loading_ellipsis') : t('common.yes')}
        <CSpinner color="light" hidden={!isLoading} component="span" size="sm" />
      </CButton>
      <CButton color="secondary" onClick={toggleParent}>
        {t('common.cancel')}
      </CButton>
    </CModalFooter>
  );
};

ConfirmFooter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  block: PropTypes.bool,
  action: PropTypes.func.isRequired,
  color: PropTypes.string,
  variant: PropTypes.string,
  toggleParent: PropTypes.func.isRequired,
  isShown: PropTypes.bool.isRequired
};

ConfirmFooter.defaultProps = {
  color: 'primary',
  variant: '',
  block: false,
};

export default ConfirmFooter;

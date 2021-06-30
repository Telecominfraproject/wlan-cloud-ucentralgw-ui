import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CIcon from '@coreui/icons-react';
import { cilClone } from '@coreui/icons';
import PropTypes from 'prop-types';
import { CButton, CPopover } from '@coreui/react';

const CopyToClipboardButton = ({ content, size }) => {
  const { t } = useTranslation();
  const [result, setResult] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setResult(t('common.copied'));
  };

  return (
    <CPopover content={t('common.copy_to_clipboard')}>
      <CButton onClick={copyToClipboard} size={size}>
        <CIcon content={cilClone} />
        {'   '}
        {result || ''}
      </CButton>
    </CPopover>
  );
};

CopyToClipboardButton.propTypes = {
  content: PropTypes.string.isRequired,
  size: PropTypes.string,
};

CopyToClipboardButton.defaultProps = {
  size: 'sm',
};

export default CopyToClipboardButton;

import React from 'react';
import PropTypes from 'prop-types';
import { CButton, CSpinner } from '@coreui/react';

const LoadingButton = ({
  isLoading,
  label,
  isLoadingLabel,
  action,
  color,
  variant,
  block,
  disabled,
}) => (
  <CButton
    variant={variant}
    color={color}
    onClick={action}
    block={block}
    disabled={isLoading || disabled}
  >
    {isLoading ? isLoadingLabel : label}
    <CSpinner hidden={!isLoading} component="span" size="sm" />
  </CButton>
);

LoadingButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  block: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  isLoadingLabel: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  color: PropTypes.string,
  variant: PropTypes.string,
};

LoadingButton.defaultProps = {
  color: 'primary',
  variant: '',
  block: true,
  disabled: false,
};

export default LoadingButton;

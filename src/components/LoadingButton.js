import React from 'react';
import PropTypes from 'prop-types';
import { CButton, CSpinner } from '@coreui/react';

const LoadingButton = ({ isLoading, label, isLoadingLabel, action, color, variant}) => (
  <CButton variant={variant} disabled={isLoading} color={color} onClick={() => action()} block>
    {isLoading ? isLoadingLabel : label}
    <CSpinner hidden={!isLoading} component="span" size="sm" />
  </CButton>
);

LoadingButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  isLoadingLabel: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  color: PropTypes.string,
  variant: PropTypes.string
};

LoadingButton.defaultProps = {
  color: "primary",
  variant: ""
}

export default LoadingButton;

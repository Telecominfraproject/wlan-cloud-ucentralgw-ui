import React from 'react';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import { useTranslation } from 'react-i18next';
import { ConfigurationFieldExplanation } from '../ConfigurationFieldExplanation';

const propTypes = {
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  onBlur: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  touched: PropTypes.bool,
  isDisabled: PropTypes.bool,
  canSelectAll: PropTypes.bool,
  isRequired: PropTypes.bool,
  isHidden: PropTypes.bool,
  isPortal: PropTypes.bool.isRequired,
  definitionKey: PropTypes.string,
};

const defaultProps = {
  value: [],
  error: false,
  touched: false,
  isRequired: false,
  canSelectAll: false,
  isDisabled: false,
  isHidden: false,
  definitionKey: null,
};

const FastMultiSelectInput = ({
  options,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  canSelectAll,
  isRequired,
  isDisabled,
  isHidden,
  isPortal,
  definitionKey,
}) => {
  const { t } = useTranslation();

  return (
    <FormControl isInvalid={error && touched} isRequired={isRequired} hidden={isHidden}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {label}
        <ConfigurationFieldExplanation definitionKey={definitionKey} />
      </FormLabel>
      <Select
        chakraStyles={{
          control: (provided, { isDisabled: isControlDisabled }) => ({
            ...provided,
            borderRadius: '15px',
            opacity: isControlDisabled ? '0.8 !important' : '1',
            border: '2px solid',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            backgroundColor: 'unset',
            border: 'unset',
          }),
        }}
        classNamePrefix={isPortal ? 'chakra-react-select' : ''}
        menuPortalTarget={isPortal ? document.body : undefined}
        isMulti
        closeMenuOnSelect={false}
        options={canSelectAll ? [{ value: '*', label: t('common.all') }, ...options] : options}
        value={
          value?.map((val) => {
            if (val === '*') return { value: val, label: t('common.all') };
            return options.find((opt) => opt.value === val);
          }) ?? []
        }
        onChange={onChange}
        onBlur={onBlur}
        isDisabled={isDisabled}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

FastMultiSelectInput.propTypes = propTypes;
FastMultiSelectInput.defaultProps = defaultProps;

export default React.memo(FastMultiSelectInput, isEqual);

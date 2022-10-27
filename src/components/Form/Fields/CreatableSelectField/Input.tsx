import React, { useCallback } from 'react';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { CreatableSelect, MultiValue } from 'chakra-react-select';
import { useTranslation } from 'react-i18next';
import { ConfigurationFieldExplanation } from '../../ConfigurationFieldExplanation';

export interface CreatableSelectInputProps {
  value?: string[];
  placeholder: string;
  onChange: (
    newValue: MultiValue<{
      value: string;
      label: string;
    }>,
  ) => void;
  onBlur: () => void;
  label: string;
  error: string | undefined;
  touched: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isHidden?: boolean;
  definitionKey?: string;
}

const _CreatableSelectInput = ({
  label,
  value = [],
  onChange,
  onBlur,
  error,
  touched,
  isRequired,
  isDisabled,
  isHidden,
  definitionKey,
  placeholder,
}: CreatableSelectInputProps) => {
  const { t } = useTranslation();
  const NoOptionsMessage = useCallback(() => <h6 className="text-center pt-2">{t('common.type_for_options')}</h6>, []);

  return (
    <FormControl isInvalid={error !== undefined && touched} isRequired={isRequired} hidden={isHidden}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {label}
        <ConfigurationFieldExplanation definitionKey={definitionKey} />
      </FormLabel>
      <CreatableSelect
        value={value.map((val) => ({ value: val, label: val }))}
        onChange={onChange}
        onBlur={onBlur}
        chakraStyles={{
          control: (provided, { isDisabled: isControlDisabled }) => ({
            ...provided,
            borderRadius: '15px',
            opacity: isControlDisabled ? '0.8 !important' : '1',
            border: '2px solid',
          }),
          input: (provided) => ({
            ...provided,
            width: '240px',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            backgroundColor: 'unset',
            border: 'unset',
          }),
        }}
        isMulti
        components={{ NoOptionsMessage }}
        options={[]}
        placeholder={placeholder}
        isDisabled={isDisabled}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export const CreatableSelectInput = React.memo(_CreatableSelectInput);

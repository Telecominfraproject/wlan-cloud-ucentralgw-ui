import React from 'react';
import { FormControl, FormErrorMessage, FormLabel, Select } from '@chakra-ui/react';
import { v4 as uuid } from 'uuid';
import { ConfigurationFieldExplanation } from '../../ConfigurationFieldExplanation';
import { FormInputProps } from 'models/FormField';

export interface SelectInputProps extends FormInputProps {
  value?: string;
  options: { label: string; value: string | number }[];
}

const _SelectInput: React.FC<SelectInputProps> = ({
  options,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  isRequired,
  isDisabled,
  isHidden,
  isLabelHidden,
  w,
  definitionKey,
}) => (
  <FormControl
    isInvalid={(error !== undefined || error) && touched}
    isRequired={isRequired}
    isDisabled={isDisabled}
    hidden={isHidden}
  >
    <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }} hidden={isLabelHidden}>
      {label} <ConfigurationFieldExplanation definitionKey={definitionKey} />
    </FormLabel>
    <Select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      borderRadius="15px"
      fontSize="sm"
      _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
      border="2px solid"
      w={w}
    >
      {options.map((option) => (
        <option value={option.value} key={uuid()}>
          {option.label}
        </option>
      ))}
    </Select>
    <FormErrorMessage>{error}</FormErrorMessage>
  </FormControl>
);

export const SelectInput = React.memo(_SelectInput);

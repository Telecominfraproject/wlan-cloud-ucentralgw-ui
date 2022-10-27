import React from 'react';
import { FormControl, FormErrorMessage, FormLabel, Switch } from '@chakra-ui/react';
import { ConfigurationFieldExplanation } from '../../ConfigurationFieldExplanation';
import { FieldInputProps } from 'models/Form';

interface Props extends FieldInputProps<boolean> {
  element?: React.ReactNode;
  isError: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FastToggleInput: React.FC<Props> = ({
  element,
  label,
  value,
  onChange,
  onBlur,
  error,
  isError,
  isRequired,
  isDisabled,
  definitionKey,
}) => (
  <FormControl isInvalid={isError} isRequired={isRequired} isDisabled={isDisabled} _disabled={{ opacity: 0.8 }}>
    <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
      {label} <ConfigurationFieldExplanation definitionKey={definitionKey} />
    </FormLabel>
    {element ?? (
      <Switch
        isChecked={value}
        onChange={onChange}
        onBlur={onBlur}
        borderRadius="15px"
        size="lg"
        isDisabled={isDisabled}
        _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
      />
    )}
    <FormErrorMessage>{error}</FormErrorMessage>
  </FormControl>
);

export default React.memo(FastToggleInput);

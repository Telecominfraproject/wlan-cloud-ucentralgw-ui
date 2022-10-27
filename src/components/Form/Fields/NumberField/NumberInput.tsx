import React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberInput as Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { ConfigurationFieldExplanation } from '../../ConfigurationFieldExplanation';
import { FieldInputProps } from 'models/Form';

interface Props extends FieldInputProps<string | undefined | string[]> {
  onChange: (v: string) => void;
  isError: boolean;
  hideArrows: boolean;
  unit?: string;
  w?: string | number;
}

const NumberInput: React.FC<Props> = ({
  label,
  value,
  unit,
  onChange,
  onBlur,
  error,
  isError,
  isRequired,
  hideArrows,
  element,
  isDisabled,
  w,
  definitionKey,
}) => {
  if (element)
    return (
      <FormControl isInvalid={isError} isRequired={isRequired} isDisabled={isDisabled}>
        <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
          {label}
        </FormLabel>
        {element}
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    );

  return (
    <FormControl isInvalid={isError} isRequired={isRequired} isDisabled={isDisabled}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {label}
        <ConfigurationFieldExplanation definitionKey={definitionKey} />
      </FormLabel>
      {unit ? (
        <InputGroup>
          <Input
            allowMouseWheel
            value={value as string | number}
            onChange={onChange}
            onBlur={onBlur}
            borderRadius="15px"
            fontSize="sm"
            w={w}
            _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
          >
            <NumberInputField border="2px solid" />
            <NumberInputStepper hidden={hideArrows}>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </Input>
          <InputRightAddon>{unit}</InputRightAddon>
        </InputGroup>
      ) : (
        <Input
          allowMouseWheel
          value={value as string | number}
          onChange={onChange}
          onBlur={onBlur}
          borderRadius="15px"
          fontSize="sm"
          w={w}
        >
          <NumberInputField border="2px solid" />
          <NumberInputStepper hidden={hideArrows}>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </Input>
      )}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default React.memo(NumberInput);

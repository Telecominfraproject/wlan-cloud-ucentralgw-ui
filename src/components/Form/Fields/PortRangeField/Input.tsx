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
  Select,
  Flex,
} from '@chakra-ui/react';

interface Props {
  label: string;
  value: { mode: 'single'; inputValue?: number } | { mode: 'range'; inputValue: [number, number] };
  onModeChange: (v: React.ChangeEvent<HTMLSelectElement>) => void;
  onChange: (v: number | [number, number]) => void;
  isError: boolean;
  error?: string | boolean;
  isDisabled: boolean;
  isRequired: boolean;
}

const PortRangeInput: React.FC<Props> = ({
  label,
  value: { mode, inputValue: value },
  onChange,
  onModeChange,
  isError,
  error,
  isRequired,
  isDisabled,
  ...props
}) => {
  const onNumberChange = (_: string, numb: number) => {
    if (numb !== undefined) {
      onChange(Number.isNaN(numb) ? 0 : numb);
    }
  };
  const onFirstNumberChange = (_: string, numb: number) => {
    if (Array.isArray(value)) {
      onChange([Number.isNaN(numb) ? 0 : numb, value[1]]);
    }
  };
  const onSecondNumberChange = (_: string, numb: number) => {
    if (Array.isArray(value)) {
      onChange([value[0], Number.isNaN(numb) ? 0 : numb]);
    }
  };

  return (
    <FormControl isInvalid={isError} isRequired={isRequired} isDisabled={isDisabled} {...props}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {label}
      </FormLabel>
      <Flex>
        <Select
          value={mode}
          onChange={onModeChange}
          borderRadius="15px"
          fontSize="sm"
          _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
          border="2px solid"
          isInvalid={false}
          w={28}
        >
          <option value="single">Single</option>
          <option value="range">Range</option>
        </Select>
        {mode === 'single' && (
          <Input
            allowMouseWheel
            value={value as string | number}
            onChange={onNumberChange}
            borderRadius="15px"
            fontSize="sm"
            ml={2}
          >
            <NumberInputField border="2px solid" w={28} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </Input>
        )}
        {mode === 'range' && (
          <>
            <Input
              allowMouseWheel
              // @ts-ignore
              value={value[0]}
              onChange={onFirstNumberChange}
              borderRadius="15px"
              fontSize="sm"
              ml={2}
            >
              <NumberInputField border="2px solid" w={28} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </Input>
            <Input
              allowMouseWheel
              // @ts-ignore
              value={value[1]}
              onChange={onSecondNumberChange}
              borderRadius="15px"
              fontSize="sm"
              ml={2}
            >
              <NumberInputField border="2px solid" w={28} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </Input>
          </>
        )}
      </Flex>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default React.memo(PortRangeInput);

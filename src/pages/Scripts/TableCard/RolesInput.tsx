import React from 'react';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { GroupBase, MultiValue, OptionBase, Select } from 'chakra-react-select';
import isEqual from 'react-fast-compare';
import { useFastField } from 'hooks/useFastField';

interface Option extends OptionBase {
  label: string;
  value: string;
}

const OPTIONS: Option[] = [
  { value: 'root', label: 'Root', isFixed: true },
  { value: 'admin', label: 'Admin' },
  { value: 'subscriber', label: 'Subscriber' },
  { value: 'partner', label: 'Partner' },
  { value: 'csr', label: 'CSR' },
  { value: 'system', label: 'System' },
  { value: 'installer', label: 'Installer' },
  { value: 'noc', label: 'NOC' },
  { value: 'accounting', label: 'Accounting' },
];

type Props = {
  name: string;
  label: string;
  isDisabled?: boolean;
};

const FastMultiSelectInput = ({ name, label, isDisabled }: Props) => {
  const { value, onChange, onBlur, error, isError } = useFastField<string[]>({ name });

  const handleChange = (newValue: MultiValue<Option>) => {
    if (newValue.length === 0) onChange(['root']);
    else onChange(newValue.map((v) => v.value));
  };

  return (
    <FormControl isInvalid={isError}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {label}
      </FormLabel>
      <Select<Option, true, GroupBase<Option>>
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            borderRadius: '15px',
            opacity: isDisabled ? '0.8 !important' : '1',
            border: '2px solid',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            backgroundColor: 'unset',
            border: 'unset',
          }),
        }}
        isMulti
        closeMenuOnSelect={false}
        options={OPTIONS}
        value={
          value
            ?.map((val) => OPTIONS.find((opt) => opt.value === val) ?? { value: '', label: '' })
            .filter((val) => val !== undefined)
            .sort((a) => (a.value === 'root' ? -1 : 1)) as MultiValue<Option>
        }
        isClearable={value.length > 1}
        onChange={handleChange}
        onBlur={onBlur}
        isDisabled={isDisabled}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default React.memo(FastMultiSelectInput, isEqual);

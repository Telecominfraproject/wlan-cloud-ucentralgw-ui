import React, { useCallback } from 'react';
import { MultiValue } from 'chakra-react-select';
import { useField } from 'formik';
import { CreatableSelectInput } from './Input';
import { FormFieldProps } from 'models/FormField';

export interface CreatableSelectFieldProps extends FormFieldProps {
  placeholder: string;
}

const _CreatableSelectField = ({
  name,
  isDisabled,
  label,
  isRequired,
  isHidden,
  emptyIsUndefined,
  placeholder,
  definitionKey,
}: CreatableSelectFieldProps) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField(name);

  const onChange = useCallback((opts: MultiValue<{ value: string; label: string }>) => {
    if (emptyIsUndefined && opts.length === 0) setValue(undefined);
    else setValue(opts.map((opt) => opt.value));
    setTouched(true);
  }, []);

  const onFieldBlur = useCallback(() => {
    setTouched(true);
  }, []);

  return (
    <CreatableSelectInput
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onFieldBlur}
      error={error}
      touched={touched}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isRequired={isRequired}
      isHidden={isHidden}
      definitionKey={definitionKey}
    />
  );
};

export const CreatableSelectField = React.memo(_CreatableSelectField);

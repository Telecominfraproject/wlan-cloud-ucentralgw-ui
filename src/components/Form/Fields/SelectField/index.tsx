import React, { useCallback } from 'react';
import { useField } from 'formik';
import { SelectInput } from './FastSelectInput';
import { FormFieldProps } from 'models/FormField';
import { useFastField } from 'hooks/useFastField';

export interface SelectFieldProps extends FormFieldProps {
  options: { label: string; value: string | number }[];
}

const _SelectField: React.FC<SelectFieldProps> = ({
  options,
  name,
  isDisabled,
  label,
  isRequired,
  onChange: onCustomChange,
  onChangeEffect,
  isHidden,
  isLabelHidden,
  emptyIsUndefined,
  isInt,
  w,
  definitionKey,
}) => {
  const { value, error, onChange: setValue, onBlur, touched } = useFastField<string | undefined | number>({ name });

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onCustomChange) {
        onCustomChange(e);
      } else {
        if (emptyIsUndefined && e.target.value === '') {
          setValue(undefined);
        } else {
          setValue(isInt ? parseInt(e.target.value, 10) : e.target.value);
        }
        if (onChangeEffect !== undefined) onChangeEffect(e);
        setTimeout(() => {
          onBlur();
        }, 200);
      }
    },
    [onCustomChange],
  );

  const onFieldBlur = useCallback(() => {
    onBlur();
  }, []);

  return (
    <SelectInput
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onFieldBlur}
      error={error}
      touched={touched}
      options={options}
      isDisabled={isDisabled}
      isRequired={isRequired}
      isHidden={isHidden}
      isLabelHidden={isLabelHidden}
      w={w}
      definitionKey={definitionKey}
    />
  );
};

export const SelectField = React.memo(_SelectField);

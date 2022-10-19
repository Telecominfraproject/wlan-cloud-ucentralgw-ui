import React, { useCallback } from 'react';
import Field from './FastToggleInput';
import { FieldProps } from 'models/Form';
import { useFastField } from 'hooks/useFastField';

export interface ToggleFieldProps extends FieldProps {
  falseIsUndefined?: boolean;
  onChangeCallback?: (e: boolean) => void;
  defaultValue?: boolean;
}

const _ToggleField = ({
  name,
  isDisabled = false,
  label,
  isRequired = false,
  defaultValue,
  element,
  falseIsUndefined,
  definitionKey,
  onChangeCallback,
}: ToggleFieldProps) => {
  const { value, error, isError, onChange, onBlur } = useFastField<boolean | undefined>({ name });

  const onValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (falseIsUndefined && !e.target.checked) onChange(undefined);
      else onChange(e.target.checked);
      if (onChangeCallback) onChangeCallback(e.target.checked);
    },
    [onChangeCallback],
  );

  return (
    <Field
      label={label ?? name}
      value={value === undefined && defaultValue !== undefined ? defaultValue : value !== undefined && value}
      onChange={onValueChange}
      error={error}
      onBlur={onBlur}
      isError={isError}
      isDisabled={isDisabled}
      isRequired={isRequired}
      element={element}
      definitionKey={definitionKey}
    />
  );
};

export const ToggleField = React.memo(_ToggleField);

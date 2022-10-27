import React, { useCallback, useMemo } from 'react';
import { LayoutProps } from '@chakra-ui/react';
import Input from './Input';
import { useFastField } from 'hooks/useFastField';
import { FieldProps } from 'models/Form';

const parseToInt = (val: string, acceptEmptyValue: boolean) => {
  if (acceptEmptyValue && val === '') return undefined;

  const parsed = parseInt(val, 10);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
};

export interface PortRangeFieldProps extends FieldProps, LayoutProps {
  hideButton?: boolean;
}

type Values = { mode: 'single'; inputValue?: number } | { mode: 'range'; inputValue: [number, number] };

const _PortRangeField: React.FC<PortRangeFieldProps> = ({
  name,
  isDisabled = false,
  label,
  isRequired = false,
  definitionKey,
  ...props
}) => {
  const { value, error, isError, onChange } = useFastField<string | number | undefined>({ name });

  const values = useMemo((): Values => {
    if (!value) return { mode: 'single', inputValue: undefined };
    if (typeof value === 'number') return { mode: 'single', inputValue: value };

    const split = value.split('-');
    if (split.length === 2) {
      const one = parseToInt(split[0], false);
      const two = parseToInt(split[1], false);
      return { mode: 'range', inputValue: [one ?? 0, two ?? 0] };
    }

    return { mode: 'single', inputValue: undefined };
  }, [value]);

  const onModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'single') onChange(8080);
    else onChange('0-10');
  }, []);

  const onValueChange = useCallback((v: number | [number, number]) => {
    if (Array.isArray(v) && v.length === 2) {
      onChange(`${v[0]}-${v[1]}`);
    } else if (typeof v === 'number') onChange(v);
  }, []);

  return (
    <Input
      label={label ?? name}
      value={values}
      onModeChange={onModeChange}
      onChange={onValueChange}
      isError={isError}
      error={error}
      isRequired={isRequired}
      isDisabled={isDisabled}
      {...props}
    />
  );
};

export const PortRangeField = React.memo(_PortRangeField);

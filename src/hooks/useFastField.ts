import { useCallback, useMemo } from 'react';
import { useField, useFormikContext } from 'formik';

export interface useFastFieldProps {
  name: string;
}

const _useFastField = <Type>({ name }: useFastFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [{ value }, { touched, error }, { setValue, setTouched }] = useField(name);

  const onChange = useCallback((newValue: Type) => {
    setValue(newValue, true);
    setTimeout(() => {
      setTouched(true, false);
    }, 200);
  }, []);

  const onBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const toReturn = useMemo(
    () => ({
      value,
      touched,
      error,
      isError: error !== undefined && touched,
      setFieldValue,
      onChange,
      onBlur,
    }),
    [value, touched, error, onChange],
  );

  return toReturn;
};

export const useFastField = _useFastField;

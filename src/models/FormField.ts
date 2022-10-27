import { ChangeEventHandler } from 'react';

export interface FormInputProps {
  label: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  onBlur: () => void;
  error?: string | boolean;
  touched?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isHidden?: boolean;
  isLabelHidden?: boolean;
  w?: string | number;
  definitionKey?: string;
}

export const defaultFormInput = {
  error: undefined,
  touched: false,
  isDisabled: false,
  isRequired: false,
  isHidden: false,
  isLabelHidden: false,
  w: undefined,
  definitionKey: undefined,
};

export interface FormFieldProps {
  name: string;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeEffect?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  isLabelHidden?: boolean;
  isHidden?: boolean;
  isInt?: boolean;
  emptyIsUndefined?: boolean;
  w?: string | number;
  definitionKey?: string;
}

export const defaultFormField = {
  onChangeEffect: undefined,
  isDisabled: false,
  isRequired: false,
  isHidden: false,
  isLabelHidden: false,
  isInt: false,
  emptyIsUndefined: false,
  w: undefined,
  definitionKey: undefined,
};

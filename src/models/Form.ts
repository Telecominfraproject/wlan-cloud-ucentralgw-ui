export interface FormType {
  submitForm: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  dirty: boolean;
}

export interface FieldProps {
  name: string;
  label?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  element?: React.ReactNode;
  isArea?: boolean;
  emptyIsUndefined?: boolean;
  isHidden?: boolean;
  definitionKey?: string;
  hideLabel?: boolean;
}

export interface FieldInputProps<T> {
  value: T;
  label: string;
  onBlur: () => void;
  error: string | undefined;
  isDisabled: boolean;
  isRequired: boolean;
  element?: React.ReactNode;
  definitionKey?: string;
}

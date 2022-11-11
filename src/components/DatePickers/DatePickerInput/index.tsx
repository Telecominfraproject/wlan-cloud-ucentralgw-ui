import React, { forwardRef } from 'react';
import { Button } from '@chakra-ui/react';

type Props = {
  value?: string;
  onClick?: () => void;
  isDisabled?: boolean;
};
const DatePickerInput = forwardRef(({ value, onClick, isDisabled }: Props, ref: React.Ref<HTMLButtonElement>) => (
  <Button colorScheme="gray" onClick={onClick} ref={ref} isDisabled={isDisabled}>
    {value}
  </Button>
));

export default DatePickerInput;

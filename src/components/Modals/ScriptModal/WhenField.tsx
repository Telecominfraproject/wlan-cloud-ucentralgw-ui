import * as React from 'react';
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '../../DatePickers/DateTimePicker';
import { useFastField } from 'hooks/useFastField';

type Props = {
  isDisabled: boolean;
};
const ScriptWhenField = ({ isDisabled }: Props) => {
  const { t } = useTranslation();
  const { value, onChange, isError, error } = useFastField<number>({ name: 'when' });

  const onRadioChange = (v: string) => {
    if (v === '0') onChange(0);
    else onChange(Math.floor(new Date().getTime() / 1000));
  };

  const onDateChange = (v: Date | null) => {
    if (v) onChange(Math.floor(v.getTime() / 1000));
  };

  const tempDate = () => {
    if (!value || value === 0) return new Date();

    return new Date(value * 1000);
  };

  return (
    <FormControl isInvalid={isError} isRequired isDisabled={isDisabled}>
      <FormLabel ms={0} mb={0} fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {t('script.when')}
      </FormLabel>
      <Flex h="40px">
        <RadioGroup onChange={onRadioChange} defaultValue={value === 0 ? '0' : '1'}>
          <Stack spacing={5} direction="row">
            <Radio colorScheme="blue" value="0">
              {t('script.now')}
            </Radio>
            <Radio colorScheme="green" value="1">
              <Flex>
                <Text my="auto" mr={2}>
                  {t('common.custom')}
                </Text>
                <InputGroup>
                  <DateTimePicker
                    date={tempDate()}
                    isStart
                    onChange={onDateChange}
                    isDisabled={!value || value === 0 || isDisabled}
                  />
                </InputGroup>
              </Flex>
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default ScriptWhenField;

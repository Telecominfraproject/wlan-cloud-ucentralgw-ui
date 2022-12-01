import * as React from 'react';
import {
  Flex,
  FormControl,
  FormLabel,
  InputGroup,
  FormErrorMessage,
  RadioGroup,
  Stack,
  Text,
  Radio,
  Input,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFastField } from 'hooks/useFastField';

export type SignatureFieldProps = {
  name: string;
  isDisabled?: boolean;
  controlProps?: React.ComponentProps<'div'>;
};

const _SignatureField = ({ name, isDisabled, controlProps }: SignatureFieldProps) => {
  const { t } = useTranslation();
  const { value, error, isError, onChange } = useFastField<string | undefined>({ name });

  const onRadioChange = (v: string) => {
    if (v === '0') onChange(undefined);
    else onChange('');
  };

  return (
    <FormControl {...controlProps} isInvalid={isError} isRequired isDisabled={isDisabled}>
      <FormLabel ms={0} mb={0} fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {t('script.signature')}
      </FormLabel>
      <Flex h="40px">
        <RadioGroup onChange={onRadioChange} defaultValue={value === undefined ? '0' : '1'}>
          <Stack spacing={5} direction="row">
            <Radio colorScheme="blue" value="0">
              {t('script.automatic')}
            </Radio>
            <Radio colorScheme="green" value="1">
              <Flex>
                <Text my="auto" mr={2}>
                  {t('common.custom')}
                </Text>
                <InputGroup>
                  <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    isDisabled={isDisabled || value === undefined}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      e.stopPropagation();
                    }}
                    w="100%"
                    _disabled={{ opacity: 0.8 }}
                  />
                </InputGroup>
              </Flex>
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <FormErrorMessage mt={0}>{error}</FormErrorMessage>
    </FormControl>
  );
};

export const SignatureField = React.memo(_SignatureField);

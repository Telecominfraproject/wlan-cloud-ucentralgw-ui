import * as React from 'react';
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFastField } from 'hooks/useFastField';

type Props = {
  isDisabled: boolean;
};
const ScriptUploadField = ({ isDisabled }: Props) => {
  const { t } = useTranslation();
  const { value, onChange, isError, error } = useFastField<string | undefined>({ name: 'uri' });

  const onRadioChange = (v: string) => {
    if (v === '0') onChange(undefined);
    else onChange('');
  };

  return (
    <FormControl isInvalid={isError} isRequired isDisabled={isDisabled}>
      <FormLabel ms={0} mb={0} fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {t('script.upload_destination')}
      </FormLabel>
      <Flex h="40px">
        <RadioGroup
          onChange={onRadioChange}
          defaultValue={value === undefined ? '0' : '1'}
          _disabled={{ opacity: 0.8 }}
        >
          <Stack spacing={5} direction="row">
            <Radio colorScheme="blue" value="0">
              {t('script.automatic')}
            </Radio>
            <Radio colorScheme="green" value="1">
              <Flex>
                <Text my="auto" mr={2} w="180px">
                  {t('script.custom_domain')}
                </Text>
                <InputGroup>
                  <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    isDisabled={isDisabled || value === undefined}
                    onClick={(e) => {
                      e.target.select();
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
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default ScriptUploadField;

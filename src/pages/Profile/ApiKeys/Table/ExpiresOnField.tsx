import * as React from 'react';
import { Box, Flex, FormControl, FormErrorMessage, FormLabel, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DateTimePicker from 'components/DatePickers/DateTimePicker';

type Props = {
  value: number;
  setValue: (value: number) => void;
};

const aYearFromNow = () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;

const ApiKeyExpiresOnField = ({ value, setValue }: Props) => {
  const { t } = useTranslation();
  const [radio, setRadioValue] = React.useState('30');

  const onRadioChange = (v: string) => {
    setRadioValue(v);
    const days = parseInt(v, 10);
    const now = new Date();
    if (days > 0) {
      now.setDate(now.getDate() + days);
      setValue(Math.floor(now.getTime() / 1000));
    } else {
      now.setDate(now.getDate() + 30);
      setValue(Math.floor(now.getTime() / 1000));
    }
  };

  const onDateChange = (v: Date | null) => {
    if (v) setValue(Math.floor(v.getTime() / 1000));
  };

  const tempDate = () => {
    if (!value || value === 0) return new Date();

    return new Date(value * 1000);
  };

  return (
    <FormControl isInvalid={value > aYearFromNow()} isRequired>
      <FormLabel ms={0} mb={2} fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }}>
        {t('certificates.expires_on')}
      </FormLabel>
      <Box>
        <RadioGroup onChange={onRadioChange} defaultValue="30">
          <Stack spacing={5} direction="column">
            <Radio colorScheme="blue" value="30">
              30 {t('common.days')}
            </Radio>
            <Radio colorScheme="blue" value="60">
              60 {t('common.days')}
            </Radio>
            <Radio colorScheme="blue" value="90">
              90 {t('common.days')}
            </Radio>
            <Radio colorScheme="blue" value="180">
              6 {t('common.months')}
            </Radio>
            <Radio colorScheme="green" value="0">
              <Flex>
                <Text my="auto" mr={2} w="180px">
                  {t('common.custom')}
                </Text>
                <DateTimePicker
                  date={tempDate()}
                  isStart
                  onChange={onDateChange}
                  isDisabled={!value || value === 0 || radio !== '0'}
                />
              </Flex>
            </Radio>
          </Stack>
        </RadioGroup>
      </Box>
      <FormErrorMessage>{t('keys.expire_error')}</FormErrorMessage>
    </FormControl>
  );
};

export default ApiKeyExpiresOnField;

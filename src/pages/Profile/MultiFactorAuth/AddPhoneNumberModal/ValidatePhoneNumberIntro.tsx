import React, { useState } from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Button, Center, FormControl, FormErrorMessage, Input, Text } from '@chakra-ui/react';
import { parsePhoneNumber, AsYouType } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';

const ValidatePhoneNumberIntro: React.FC<{ nextStep: (phone: string) => void }> = ({ nextStep }) => {
  const { t } = useTranslation();
  const [temp, setTemp] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      let num = e.target.value;
      if (num.length > 0 && num.charAt(0) !== '+') num = `+${num}`;
      const newNum = new AsYouType().input(num);
      setTemp(newNum);
    } catch {
      setTemp(e.target.value);
    }
  };

  const isValid = () => {
    if (temp.length > 0) {
      try {
        let num = temp;
        if (num.charAt(0) !== '+') num = `+${num}`;
        const parsedNumber = parsePhoneNumber(num);
        return parsedNumber !== undefined && parsedNumber !== null && parsedNumber.isValid();
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleClick = () => {
    const newString = temp.split(' ').join('');
    nextStep(newString);
  };

  return (
    <>
      <Text my={4}>
        <b>{t('account.phone_number_add_introduction')}</b>
      </Text>
      <FormControl isInvalid={!isValid}>
        <Input
          value={temp}
          onChange={onChange}
          borderRadius="15px"
          fontSize="sm"
          type="text"
          w="200px"
          autoComplete="off"
          _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
        />
        <FormErrorMessage>{t('form.invalid_phone_number')}</FormErrorMessage>
      </FormControl>
      <Center>
        <Button my={6} colorScheme="blue" onClick={handleClick} isDisabled={!isValid()} rightIcon={<ArrowRightIcon />}>
          {t('account.proceed_to_activation')}
        </Button>
      </Center>
    </>
  );
};

export default ValidatePhoneNumberIntro;

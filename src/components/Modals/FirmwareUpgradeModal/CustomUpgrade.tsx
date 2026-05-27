import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
  upgrade: (uri: string) => void;
  isLoading: boolean;
}

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' ||
      url.protocol === 'https:';
  } catch {
    return false;
  }
};

const CustomUpgrade: React.FC<Props> = ({
  upgrade,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [uri, setUri] = React.useState('');
  const trimmed = uri.trim();
  const valid = isValidUrl(trimmed);

  const onUpgrade = () => {
    if (valid) {
      upgrade(trimmed);
    }
  };

  return (
    <Box mt={4}>
      <Heading size="sm" mb={4}>
        {t('commands.custom_upgrade')}
      </Heading>
      <FormControl
        mb={2}
        isInvalid={trimmed.length > 0 && !valid}
      >
        <FormLabel
          ms="4px"
          fontSize="md"
          fontWeight="normal"
        >
          {t('commands.firmware_url')}
        </FormLabel>
        <Input
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          placeholder="https://"
        />
      </FormControl>
      <Button
        colorScheme="blue"
        onClick={onUpgrade}
        isLoading={isLoading}
        isDisabled={!valid}
      >
        {t('commands.upgrade')}
      </Button>
    </Box>
  );
};

export default CustomUpgrade;

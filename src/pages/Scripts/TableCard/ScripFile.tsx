import * as React from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  Spacer,
  Text,
  Textarea,
  useBoolean,
  useClipboard,
} from '@chakra-ui/react';
import { UploadSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { useFastField } from 'hooks/useFastField';

type Props = {
  isDisabled: boolean;
};
const ScriptFileInput = ({ isDisabled }: Props) => {
  const { t } = useTranslation();
  const [fileKey, setFileKey] = React.useState(uuid());
  const fileInputRef = React.useRef<HTMLInputElement>();
  const { onChange, error, isError, value, onBlur } = useFastField<string | undefined>({ name: 'content' });
  const [isTooLarge, { on, off }] = useBoolean();
  const { hasCopied, onCopy, setValue } = useClipboard(value ?? '');

  let fileReader: FileReader | undefined;

  const handleStringFileRead = () => {
    if (fileReader) {
      const content = fileReader.result;
      if (content) {
        setFileKey(uuid());
        onChange(content as string);
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef?.current?.click();
  };

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    off();

    // File has to be under 2MB
    if (file && file.size < 500 * 1024) {
      fileReader = new FileReader();
      fileReader.onloadend = handleStringFileRead;
      fileReader.readAsText(file);
    } else {
      on();
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  React.useEffect(() => {
    if (value) setValue(value);
  }, [value]);

  return (
    <FormControl isInvalid={isError} isDisabled={isDisabled} mt={2}>
      <FormLabel ms="4px" fontSize="md" fontWeight="normal" _disabled={{ opacity: 0.8 }} display="flex">
        <Text my="auto">{t('script.one')}</Text>
        <Flex>
          <Input
            borderRadius="15px"
            pt={1}
            fontSize="sm"
            type="file"
            onChange={changeFile}
            key={fileKey}
            isDisabled={isDisabled}
            w="300px"
            mb={2}
            ref={fileInputRef as React.LegacyRef<HTMLInputElement> | undefined}
            hidden
          />
          <Button
            onClick={handleUploadClick}
            rightIcon={<UploadSimple />}
            size="sm"
            my="auto"
            ml={2}
            isDisabled={isDisabled}
          >
            {t('script.upload_file')}
          </Button>
          {isTooLarge && (
            <Text ml={2} fontWeight="bold" textColor="red" my="auto">
              {t('script.file_too_large')}
            </Text>
          )}
          <Spacer />
          <Button onClick={onCopy} size="md" ml={2} colorScheme="teal">
            {hasCopied ? t('common.copied') : t('common.copy')}
          </Button>
        </Flex>
      </FormLabel>
      <InputGroup size="md">
        <Textarea
          value={value}
          onChange={onInputChange}
          onBlur={onBlur}
          borderRadius="15px"
          fontSize="sm"
          minH="200px"
          _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}
        />
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default ScriptFileInput;

import * as React from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Code,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Spacer,
  Switch,
  Tag,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { NumberField } from '../../Form/Fields/NumberField';
import { SelectField } from '../../Form/Fields/SelectField';
import { ToggleField } from '../../Form/Fields/ToggleField';
import ScriptFileInput from './ScripFile';
import ScriptUploadField from './UploadField';
import { SignatureField } from 'components/Form/Fields/SignatureField';
import { DeviceScriptCommand } from 'hooks/Network/Commands';
import { Script } from 'hooks/Network/Scripts';
import { GatewayDevice } from 'models/Device';

const FormSchema = (t: (str: string) => string) =>
  Yup.object().shape({
    serialNumber: Yup.string().required(t('form.required')),
    deferred: Yup.boolean().required(t('form.required')),
    type: Yup.string().required(t('form.required')),
    timeout: Yup.number().when('deferred', {
      is: false,
      then: Yup.number()
        .required(t('form.required'))
        .moreThan(10)
        .lessThan(5 * 60), // 5 mins
    }),
    script: Yup.string().required(t('form.required')),
    when: Yup.number().required(t('form.required')),
    uri: Yup.string().min(1, t('form.required')),
    signature: Yup.string(),
  });

const DEFAULT_VALUES = (serialNumber: string) =>
  ({
    serialNumber,
    deferred: true,
    type: 'shell',
    script: '',
    when: 0,
  } as DeviceScriptCommand);

type Props = {
  onStart: (data: DeviceScriptCommand) => Promise<void>;
  formRef: React.Ref<FormikProps<DeviceScriptCommand>>;
  formKey: string;
  areFieldsDisabled: boolean;
  waitForResponse: boolean;
  onToggleWaitForResponse: () => void;
  script?: Script;
  device?: GatewayDevice;
  isDiagnostics?: boolean;
};

const CustomScriptForm = ({
  onStart,
  formRef,
  formKey,
  areFieldsDisabled,
  waitForResponse,
  onToggleWaitForResponse,
  device,
  script,
  isDiagnostics,
}: Props) => {
  const { t } = useTranslation();
  const { hasCopied, onCopy, setValue } = useClipboard(script?.content ?? '');

  React.useEffect(() => {
    setValue(script?.content ?? '');
  }, [script?.content]);

  return (
    <Formik
      innerRef={formRef}
      enableReinitialize
      key={formKey}
      initialValues={
        script
          ? // @ts-ignore
            ({
              ...script,
              serialNumber: device?.serialNumber ?? '',
              script: script.content,
              uri: script.defaultUploadURI.length === 0 ? undefined : script.defaultUploadURI,
              when: 0,
            } as DeviceScriptCommand)
          : DEFAULT_VALUES(device?.serialNumber ?? '')
      }
      validationSchema={isDiagnostics ? undefined : FormSchema(t)}
      validateOnMount
      onSubmit={async (data) => onStart(data)}
    >
      {(props: { setFieldValue: (k: string, v: unknown) => void; values: DeviceScriptCommand }) => (
        <Form>
          <Flex mt={2}>
            <FormControl w="180px">
              <FormLabel mb="12px">{t('controller.trace.wait')}</FormLabel>
              <Switch size="lg" isChecked={waitForResponse} onChange={onToggleWaitForResponse} />
            </FormControl>
            <Box w="120px" mr={2} mb={4}>
              <ToggleField
                name="deferred"
                label={t('script.deferred')}
                onChangeCallback={(v) => {
                  if (v) {
                    setTimeout(() => props.setFieldValue('timeout', undefined), 100);
                  } else {
                    setTimeout(() => props.setFieldValue('timeout', 120), 100);
                  }
                }}
                isDisabled={areFieldsDisabled || isDiagnostics}
              />
            </Box>
            <Box>
              {!props.values.deferred && (
                <NumberField
                  name="timeout"
                  label={t('script.timeout')}
                  isDisabled={areFieldsDisabled}
                  unit="s"
                  isRequired
                  w="100px"
                />
              )}
            </Box>
          </Flex>
          <Divider mt={2} mb={4} border="1px" borderColor="gray" />
          {!isDiagnostics && script && (
            <>
              <Flex mt={2}>
                <Heading size="md" my="auto">
                  {script.name}
                </Heading>
                <Tag colorScheme="teal" size="lg" my="auto" mx={2}>
                  {script.type}
                </Tag>
                <Tag colorScheme="blue" size="lg" my="auto">
                  {script.author}
                </Tag>
                {script.uri.length > 0 && (
                  <Button
                    onClick={() => window.open(script.uri, '_blank')?.focus()}
                    colorScheme="blue"
                    variant="link"
                    rightIcon={<ExternalLinkIcon />}
                    ml={2}
                  >
                    {t('script.helper')}
                  </Button>
                )}
              </Flex>
              <Text fontStyle="italic" mt={2}>
                {script.description}
              </Text>
              <Text mt={2}>
                {t('script.upload_destination')}:{' '}
                <b>{script.defaultUploadURI === '' ? t('script.automatic') : script.defaultUploadURI}</b>
              </Text>
            </>
          )}
          {!script && (
            <Box mt={2}>
              <ScriptUploadField isDisabled={areFieldsDisabled || script !== undefined} />
            </Box>
          )}
          {!isDiagnostics && (
            <>
              <Flex>
                <Box>
                  {device?.restrictedDevice && !device?.restrictionDetails?.developer && (
                    <SignatureField name="signature" isDisabled={areFieldsDisabled} />
                  )}
                </Box>
              </Flex>
              <SelectField
                name="type"
                label={t('common.type')}
                options={[
                  { value: 'shell', label: 'Shell' },
                  { value: 'bundle', label: 'Bundle' },
                ]}
                isRequired
                isDisabled={areFieldsDisabled || script !== undefined}
                isHidden={script !== undefined}
                w="120px"
              />
              {script && (
                <Flex>
                  <Heading my="auto" size="sm">
                    {t('script.one')}
                  </Heading>
                  <Spacer />
                  <Button onClick={onCopy} size="sm" colorScheme="teal">
                    {hasCopied ? t('common.copied') : t('common.copy')}
                  </Button>
                </Flex>
              )}
              <Box>
                {script ? (
                  <Code whiteSpace="pre-line" w="100%" mt={2}>
                    {script.content.replace(/^\n/, '')}
                  </Code>
                ) : (
                  <ScriptFileInput isDisabled={areFieldsDisabled || script !== undefined} />
                )}
              </Box>
            </>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default CustomScriptForm;

import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Heading,
  HStack,
  Spacer,
  Spinner,
  useBoolean,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import EditScriptForm from './Form';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { ToggleEditButton } from 'components/Buttons/ToggleEditButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { Script, useGetDeviceScript, useUpdateScript } from 'hooks/Network/Scripts';
import { useFormRef } from 'hooks/useFormRef';

type Props = {
  id: string;
  onIdSelect: (id: string) => void;
};

const ViewScriptCard = ({ id, onIdSelect }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const getScript = useGetDeviceScript({ id });
  const update = useUpdateScript({ id });
  const [isEditing, { toggle, off }] = useBoolean();
  const { form, formRef } = useFormRef();

  const onSubmit = React.useCallback(
    async (
      data: {
        id: string;
        description?: string | undefined;
        name?: string | undefined;
        uri?: string | undefined;
        content?: string | undefined;
        defaultUploadURI?: string | undefined;
        version?: string | undefined;
        deferred?: boolean | undefined;
        timeout?: number | undefined;
        restricted?: string[];
      },
      onSuccess: () => void,
      onError: () => void,
    ) =>
      update.mutateAsync(
        { ...data, defaultUploadURI: data.defaultUploadURI ?? '' },
        {
          onSuccess: () => {
            toast({
              id: `script-update-success`,
              title: t('common.success'),
              description: t('script.update_success'),
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            onSuccess();
            toggle();
          },
          onError: (e) => {
            onError();
            if (axios.isAxiosError(e))
              toast({
                id: `script-create-error`,
                title: t('common.error'),
                description: e?.response?.data?.ErrorDescription,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
          },
        },
      ),
    [toggle, t, toast, getScript.data],
  );

  React.useEffect(() => {
    off();
  }, [id]);

  React.useEffect(() => {
    if (axios.isAxiosError(getScript.error)) {
      onIdSelect('0');
    }
  }, [getScript.error]);

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{getScript.data?.name}</Heading>
        <Spacer />
        <HStack>
          {isEditing && (
            <SaveButton
              onClick={form.submitForm}
              isLoading={form.isSubmitting}
              isDisabled={!form.isValid || !form.dirty}
            />
          )}
          <ToggleEditButton
            isEditing={isEditing}
            toggleEdit={toggle}
            isDirty={form.dirty}
            isDisabled={getScript.isFetching}
            isCompact
          />
          <RefreshButton
            onClick={getScript.refetch}
            isFetching={getScript.isFetching}
            isDisabled={isEditing}
            isCompact
            colorScheme="blue"
          />
        </HStack>
      </CardHeader>
      <CardBody>
        <Box w="100%">
          {getScript.error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                {axios.isAxiosError(getScript.error)
                  ? getScript.error.response?.data?.ErrorDescription
                  : t('common.error')}
              </AlertDescription>
            </Alert>
          )}
          {getScript.isFetching && (
            <Center my="100px" w="100%">
              <Spinner size="xl" />
            </Center>
          )}
          {getScript.data && (
            <EditScriptForm
              script={getScript.data}
              formRef={formRef as React.Ref<FormikProps<Script>>}
              isEditing={isEditing}
              onSubmit={onSubmit}
            />
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default ViewScriptCard;

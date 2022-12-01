import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Select,
  Spinner,
  useBoolean,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FormikProps } from 'formik';
import { ArrowLeft } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import ConfirmIgnoreCommand from '../ConfirmIgnoreCommand';
import { Modal } from '../Modal';
import CustomScriptForm from './Form';
import ScriptResultDisplay from './ResultDisplay';
import { useAuth } from 'contexts/AuthProvider';
import { DeviceScriptCommand, useDeviceScript } from 'hooks/Network/Commands';
import { useGetAllDeviceScripts } from 'hooks/Network/Scripts';
import useCommandModal from 'hooks/useCommandModal';
import { useFormRef } from 'hooks/useFormRef';
import { GatewayDevice } from 'models/Device';

export type ScriptModalProps = {
  device?: GatewayDevice;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

export const ScriptModal = ({ device, modalProps }: ScriptModalProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const getScripts = useGetAllDeviceScripts();
  const [selectedScript, setSelectedScript] = React.useState('');
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = React.useState(uuid());
  const doScript = useDeviceScript({ serialNumber: device?.serialNumber ?? '' });
  const { onCopy, hasCopied, setValue } = useClipboard('');
  const { form, formRef } = useFormRef();
  const { isConfirmOpen, closeConfirm, closeModal, closeCancelAndForm } = useCommandModal({
    isLoading: doScript.isLoading,
    onModalClose: modalProps.onClose,
  });
  const [waitForResponse, { toggle: onToggleWaitForResponse }] = useBoolean();
  const role = user?.userRole;

  const onStart = async (data: DeviceScriptCommand & { defaultUploadURI?: string }) => {
    let requestData: {
      [k: string]: unknown;
      serialNumber: string;
      timeout?: number | undefined;
    } = data;
    if (selectedScript === 'diagnostics') {
      requestData = {
        serialNumber: device?.serialNumber ?? '',
        when: 0,
        deferred: true,
        uri: data.defaultUploadURI && data.defaultUploadURI?.length > 0 ? data.defaultUploadURI : undefined,
        type: 'diagnostic',
      };
    } else if (selectedScript !== '') {
      requestData = {
        serialNumber: device?.serialNumber ?? '',
        when: 0,
        deferred: data.deferred,
        timeout: data.timeout,
        signature: device?.restrictedDevice ? data.signature : undefined,
        uri: data.defaultUploadURI && data.defaultUploadURI?.length > 0 ? data.defaultUploadURI : undefined,
        scriptId: selectedScript,
        type: data.type,
      };
    }

    doScript.mutate(requestData, {
      onSuccess: (response) => {
        setValue(response.results?.status?.result ?? JSON.stringify(response.results ?? {}, null, 2));
        queryClient.invalidateQueries(['commands', device?.serialNumber ?? '']);
      },
    });
    if (!waitForResponse) {
      toast({
        id: 'script-update-success',
        title: t('common.success'),
        description: t('script.started_execution'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      closeCancelAndForm();
    }
  };

  const options = React.useMemo(() => {
    if (!role) return [];
    return getScripts.data?.filter((curr) => curr.restricted.includes(role ?? '')) ?? [];
  }, [role, getScripts.data]);

  const areFieldsDisabled = doScript.isLoading || !device;

  const display = () => {
    if (doScript.isLoading)
      return (
        <Center my="100px">
          <Spinner size="xl" />
        </Center>
      );
    if (doScript.data) return <ScriptResultDisplay result={doScript.data} />;
    if (doScript.error)
      return (
        <Alert mb={6} status="error">
          <AlertIcon />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>
            {axios.isAxiosError(doScript.error) && doScript.error?.response?.data?.ErrorDescription}
          </AlertDescription>
        </Alert>
      );
    if (!doScript.isLoading && !doScript.data)
      return (
        <>
          {role === 'root' || options.length > 0 ? (
            <Select
              value={selectedScript}
              onChange={(e) => {
                setSelectedScript(e.target.value);
                setFormKey(uuid());
              }}
              w="max-content"
            >
              <option value="">
                {role === 'root' ? `${t('common.custom')} ${t('script.one')}` : t('common.none')}
              </option>
              <option value="diagnostics">{t('script.diagnostics')}</option>
              {options
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((curr) => (
                  <option value={curr.id} key={curr.id}>
                    {curr.name}
                  </option>
                ))}
            </Select>
          ) : (
            <Center mt={2}>
              <Alert status="error" w="max-content">
                <AlertIcon />
                <AlertDescription>{t('script.no_script_available')}</AlertDescription>
              </Alert>
            </Center>
          )}
          {device && (role === 'root' || selectedScript !== '') && (
            <CustomScriptForm
              onStart={onStart}
              formKey={formKey}
              formRef={formRef as React.Ref<FormikProps<DeviceScriptCommand>>}
              waitForResponse={waitForResponse}
              onToggleWaitForResponse={onToggleWaitForResponse}
              areFieldsDisabled={areFieldsDisabled}
              device={device}
              isDiagnostics={selectedScript === 'diagnostics'}
              script={selectedScript !== '' ? getScripts.data?.find((curr) => curr.id === selectedScript) : undefined}
            />
          )}
        </>
      );
    return null;
  };

  React.useEffect(() => {
    setFormKey(uuid());
    doScript.reset();
    setSelectedScript('');
  }, [device, modalProps.isOpen]);

  return (
    <>
      <Modal
        {...modalProps}
        onClose={closeModal}
        title={t('script.device_title')}
        topRightButtons={
          doScript.data ? (
            <>
              <Button onClick={onCopy} size="md" colorScheme="teal">
                {hasCopied ? `${t('common.copied')}!` : t('common.copy')}
              </Button>
              <Button rightIcon={<ArrowLeft />} onClick={doScript.reset}>
                {t('common.go_back')}
              </Button>
            </>
          ) : (
            <Button
              colorScheme="blue"
              onClick={form.submitForm}
              isDisabled={!form.isValid || (role !== 'root' && selectedScript === '')}
              isLoading={doScript.isLoading || form.isSubmitting}
            >
              {t('common.start')}
            </Button>
          )
        }
      >
        {
          // @ts-ignore
          <Box>{display()}</Box>
        }
      </Modal>
      <ConfirmIgnoreCommand
        modalProps={{ isOpen: isConfirmOpen, onOpen: () => {}, onClose: closeConfirm }}
        confirm={closeCancelAndForm}
        cancel={closeConfirm}
      />
    </>
  );
};

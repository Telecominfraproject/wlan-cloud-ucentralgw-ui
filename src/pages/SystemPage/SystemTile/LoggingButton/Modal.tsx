import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Heading,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UseDisclosureReturn,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { FloppyDisk } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { LoadingOverlay } from 'components/LoadingOverlay';
import { Modal } from 'components/Modals/Modal';
import { useGetSystemLogLevelNames, useGetSystemLogLevels, useUpdateSystemLogLevels } from 'hooks/Network/System';

type Props = {
  modalProps: UseDisclosureReturn;
  endpoint: string;
  token: string;
};

const SystemLoggingModal = ({ modalProps, endpoint, token }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const getLevels = useGetSystemLogLevels({ endpoint, token, enabled: false });
  const getNames = useGetSystemLogLevelNames({ endpoint, token, enabled: false });
  const updateLevels = useUpdateSystemLogLevels({ endpoint, token });
  const [newLevels, setNewLevels] = React.useState<{ tag: string; value: string }[]>([]);

  const onUpdate = () => {
    updateLevels.mutate(newLevels, {
      onSuccess: () => {
        toast({
          id: 'log-level-update-success',
          title: t('common.success'),
          description: t('system.update_level_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        modalProps.onClose();
      },
    });
  };

  const onLevelChange = React.useCallback(
    (tag: string, originalValue: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === originalValue) {
        setNewLevels((prev) => prev.filter((level) => level.tag !== tag));
      } else {
        setNewLevels((prev) => [
          ...prev.filter(({ tag: foundTag }) => foundTag !== tag),
          { tag, value: e.target.value },
        ]);
      }
    },
    [newLevels, getLevels.data],
  );

  const levelOptions = getNames.data
    ? getNames.data
        .sort((a, b) => a.localeCompare(b))
        .map((level) => (
          <option key={uuid()} value={level}>
            {level}
          </option>
        ))
    : [];
  const row = React.useCallback(
    (tag: string, value: string) => {
      const newValue = newLevels.find(({ tag: foundTag }) => foundTag === tag)?.value;
      return (
        <Tr key={uuid()}>
          <Td>
            <Heading size="sm">{tag}</Heading>
          </Td>
          <Td fontFamily="monospace" pt={2} fontSize="md">
            {getNames.data ? (
              <Select
                variant={newValue ? 'filled' : undefined}
                _hover={{
                  bg: newValue ? 'teal.300' : undefined,
                }}
                bg={newValue ? 'teal.300' : undefined}
                value={newValue ?? value}
                onChange={onLevelChange(tag, value)}
              >
                {levelOptions}
              </Select>
            ) : (
              value
            )}
          </Td>
        </Tr>
      );
    },
    [t, getNames.data, onLevelChange],
  );

  const rows = React.useMemo(() => {
    if (!getLevels.data) return [];

    return getLevels.data.sort((a, b) => a.tag.localeCompare(b.tag)).map((level) => row(level.tag, level.value));
  }, [getLevels.data, row]);

  React.useEffect(() => {
    if (modalProps.isOpen) {
      setNewLevels([]);
      getLevels.refetch();
      getNames.refetch();
    }
  }, [modalProps.isOpen]);

  React.useEffect(() => {
    setNewLevels([]);
  }, [getLevels.data]);

  return (
    <Modal
      isOpen={modalProps.isOpen}
      onClose={modalProps.onClose}
      title={t('system.logging')}
      options={{
        modalSize: 'sm',
        maxWidth: { sm: '600px', md: '600px', lg: '600px', xl: '600px' },
      }}
      topRightButtons={
        <Button
          colorScheme="blue"
          rightIcon={<FloppyDisk size={20} />}
          onClick={onUpdate}
          isDisabled={newLevels.length === 0}
          isLoading={updateLevels.isLoading}
        >
          {t('system.update_levels')} {newLevels.length > 0 ? newLevels.length : ''}
        </Button>
      }
    >
      <>
        {updateLevels.error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>
              {axios.isAxiosError(updateLevels.error)
                ? updateLevels.error.response?.data?.ErrorDescription
                : t('common.error')}
            </AlertDescription>
          </Alert>
        )}
        <LoadingOverlay isLoading={getLevels.isFetching}>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>{t('system.subsystems')}</Th>
                  <Th w="220px">{t('system.level')}</Th>
                </Tr>
              </Thead>
              <Tbody>{rows}</Tbody>
            </Table>
            {getLevels.data && rows.length === 0 ? (
              <Center mt={2}>
                <Alert status="info" w="unset">
                  <AlertIcon />
                  <AlertDescription>{t('system.no_log_levels')}</AlertDescription>
                </Alert>
              </Center>
            ) : null}
          </Box>
        </LoadingOverlay>
      </>
    </Modal>
  );
};

export default SystemLoggingModal;

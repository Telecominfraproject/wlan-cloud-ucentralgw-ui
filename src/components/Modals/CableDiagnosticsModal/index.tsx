import React from 'react';
import {
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Center,
  Spinner,
  Checkbox,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { PlugsConnected } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CloseButton } from 'components/Buttons/CloseButton';
import { ResponsiveButton } from 'components/Buttons/ResponsiveButton';
import { ModalHeader } from 'components/Containers/Modal/ModalHeader';
import { useCableDiagnostics } from 'hooks/Network/Devices';
import { ModalProps } from 'models/Modal';
import Button from 'theme/components/button';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import { DataGrid } from 'components/DataTables/DataGrid';

export type CableDiagnosticsModalProps = {
  modalProps: ModalProps;
  serialNumber: string;
  port: string;
};

type DiagnosticsRow = {
  port: string;
  linkStatus: string;
  pairA: string;
  pairB: string;
  pairC: string;
  pairD: string;
  type: string;
};

type OpticalRow = {
  port: string;
  vendorName: string;
  formFactor: string;
  partNumber: string;
  serialNumber: string;
  temperature: string;
  txPower: string;
  rxPower: string;
  revision: string;
};

export const CableDiagnosticsModal = ({
  modalProps: { isOpen, onClose },
  serialNumber,
  port,
}: CableDiagnosticsModalProps) => {
  const { t } = useTranslation();
  const [selectedPorts, setSelectedPorts] = React.useState<string[]>([]);
  const [diagnosticsResult, setDiagnosticsResult] = React.useState<any>(null);
  const { mutateAsync: diagnose, isLoading } = useCableDiagnostics({ serialNumber });

  const handlePortToggle = (port: string) => {
    setSelectedPorts((prev) => (prev.includes(port) ? prev.filter((p) => p !== port) : [...prev, port]));
  };

  const handleDiagnose = async () => {
    if (port) {
      try {
        const result = await diagnose([port]);
        setDiagnosticsResult(result);
      } catch (error) {
        console.error('Error diagnosing cable:', error);
      }
    }
  };

  const tableController = useDataGrid({
    tableSettingsId: 'cable.diagnostics.table',
    defaultOrder: ['port', 'linkStatus', 'pairA', 'pairB', 'pairC', 'pairD', 'type'],
    showAllRows: true,
  });

  const columns: DataGridColumn<DiagnosticsRow | OpticalRow>[] = React.useMemo(() => {
    const data = diagnosticsResult?.results?.status?.text?.[port];
    const isOpticalData = data && 'form-factor' in data;

    return isOpticalData
      ? [
          {
            id: 'vendorName',
            header: 'Vendor Name',
            accessorKey: 'vendorName',
          },
          {
            id: 'formFactor',
            header: 'Form Factor',
            accessorKey: 'formFactor',
          },
          {
            id: 'partNumber',
            header: 'Part Number',
            accessorKey: 'partNumber',
          },
          {
            id: 'serialNumber',
            header: 'Serial Number',
            accessorKey: 'serialNumber',
          },
          {
            id: 'temperature',
            header: 'Temperature',
            accessorKey: 'temperature',
          },
          {
            id: 'txPower',
            header: 'TX Power',
            accessorKey: 'txPower',
          },
          {
            id: 'rxPower',
            header: 'RX Power',
            accessorKey: 'rxPower',
          },
          {
            id: 'revision',
            header: 'Revision',
            accessorKey: 'revision',
          },
        ]
      : [
          {
            id: 'port',
            header: 'Port',
            accessorKey: 'port',
          },
          {
            id: 'linkStatus',
            header: 'Link Status',
            accessorKey: 'linkStatus',
          },
          {
            id: 'pairA',
            header: 'Pair A',
            accessorKey: 'pairA',
          },
          {
            id: 'pairB',
            header: 'Pair B',
            accessorKey: 'pairB',
          },
          {
            id: 'pairC',
            header: 'Pair C',
            accessorKey: 'pairC',
          },
          {
            id: 'pairD',
            header: 'Pair D',
            accessorKey: 'pairD',
          },
          {
            id: 'type',
            header: 'Type',
            accessorKey: 'type',
          },
        ];
  }, [diagnosticsResult]);

  const formatDiagnosticsData = (result: any): (DiagnosticsRow | OpticalRow)[] => {
    if (!result?.results?.status?.text?.[port]) return [];

    const data = result.results.status.text[port];

    if (data['form-factor']) {
      return [
        {
          port,
          vendorName: data['vendor-name'] || 'N/A',
          formFactor: data['form-factor'] || 'N/A',
          partNumber: data['part-number'] || 'N/A',
          serialNumber: data['serial-number'] || 'N/A',
          temperature: data.temperature ? `${data.temperature.toFixed(2)}` : 'N/A',
          txPower: data['tx-optical-power'] ? `${data['tx-optical-power']}` : 'N/A',
          rxPower: data['rx-optical-power'] ? `${data['rx-optical-power']}` : 'N/A',
          revision: data.revision || 'N/A',
        },
      ];
    }

    return [
      {
        port,
        linkStatus: data['link-status'],
        pairA: `${data['pair-A'].meters} (${data['pair-A'].status})`,
        pairB: `${data['pair-B'].meters} (${data['pair-B'].status})`,
        pairC: `${data['pair-C'].meters} (${data['pair-C'].status})`,
        pairD: `${data['pair-D'].meters} (${data['pair-D'].status})`,
        type: data.type,
      },
    ];
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent maxW="50vw">
        <ModalHeader title={t('commands.cable_diagnostics')} right={<CloseButton onClick={onClose} />} />
        <ModalBody pb={6}>
          {isLoading ? (
            <Center my={4} flexDirection="column" gap={4}>
              <Spinner size="lg" />
              <Text>Please wait...</Text>
              <Text fontSize="sm" color="gray.500">
                Please do not close this window. This may take a few seconds.
              </Text>
            </Center>
          ) : (
            <Center flexDirection="column" gap={4}>
              <ResponsiveButton
                color="blue"
                icon={<PlugsConnected size={20} />}
                label={`${
                  diagnosticsResult && formatDiagnosticsData(diagnosticsResult).length > 0 ? 'Retake' : 'Start'
                } Test for Port ${port}`}
                onClick={handleDiagnose}
                isLoading={isLoading}
                isDisabled={!port}
                isCompact={false}
              />
              {diagnosticsResult && formatDiagnosticsData(diagnosticsResult).length > 0 && (
                <DataGrid<DiagnosticsRow | OpticalRow>
                  controller={tableController}
                  header={{
                    title: '',
                    objectListed: 'Cable Diagnostics',
                  }}
                  columns={columns}
                  isLoading={isLoading}
                  data={formatDiagnosticsData(diagnosticsResult)}
                  options={{
                    isHidingControls: true,
                  }}
                />
              )}
            </Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

import * as React from 'react';
import { Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import LinkStateTable from './LinkStateTable';
import SwitchInterfaceTable from './SwitchInterfaceTable';
import { DeviceLinkState, useGetDeviceLastStats } from 'hooks/Network/Statistics';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CableDiagnosticsModal } from 'components/Modals/CableDiagnosticsModal';
import { useDisclosure } from '@chakra-ui/react';

type Props = {
  serialNumber: string;
};

const SwitchPortExamination = ({ serialNumber }: Props) => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [selectedPort, setSelectedPort] = React.useState<string>('');
  const cableDiagnosticsModalProps = useDisclosure();

  const handleTabsChange = React.useCallback((index: number) => {
    setTabIndex(index);
  }, []);
  const getStats = useGetDeviceLastStats({ serialNumber });

  const upLinkStates: (DeviceLinkState & { name: string })[] = React.useMemo(() => {
    if (!getStats.data || !getStats.data['link-state']?.upstream) return [];

    return Object.entries(getStats.data['link-state']?.upstream).map(([name, value]) => ({
      ...value,
      name,
    }));
  }, [getStats.data]);
  const downLinkStates: (DeviceLinkState & { name: string })[] = React.useMemo(() => {
    if (!getStats.data || !getStats.data['link-state']?.downstream) return [];

    return Object.entries(getStats.data['link-state']?.downstream).map(([name, value]) => ({
      ...value,
      name,
    }));
  }, [getStats.data]);

  const handleOpenCableDiagnostics = React.useCallback((port: string) => {
    setSelectedPort(port);
    cableDiagnosticsModalProps.onOpen();
  }, []);

  return (
    <>
      <Card p={0} mb={4}>
        <CardBody p={0} display="block">
          <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed" w="100%">
            <TabList>
              <Tab fontSize="lg" fontWeight="bold">
                Interfaces
              </Tab>
              <Tab fontSize="lg" fontWeight="bold">
                Link-State (Up)
              </Tab>
              <Tab fontSize="lg" fontWeight="bold">
                Link-State (Down)
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {getStats.data ? (
                  <SwitchInterfaceTable
                    statistics={getStats.data}
                    refetch={getStats.refetch}
                    isFetching={getStats.isFetching}
                  />
                ) : (
                  <Spinner size="xl" />
                )}
              </TabPanel>
              <TabPanel>
                {getStats.data ? (
                  <LinkStateTable
                    statistics={upLinkStates}
                    refetch={getStats.refetch}
                    isFetching={getStats.isFetching}
                    type="upstream"
                    serialNumber={serialNumber}
                    onOpenCableDiagnostics={handleOpenCableDiagnostics}
                  />
                ) : (
                  <Spinner size="xl" />
                )}
              </TabPanel>
              <TabPanel>
                {getStats.data ? (
                  <LinkStateTable
                    statistics={downLinkStates}
                    refetch={getStats.refetch}
                    isFetching={getStats.isFetching}
                    type="downstream"
                    serialNumber={serialNumber}
                    onOpenCableDiagnostics={handleOpenCableDiagnostics}
                  />
                ) : (
                  <Spinner size="xl" />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
      <CableDiagnosticsModal modalProps={cableDiagnosticsModalProps} serialNumber={serialNumber} port={selectedPort} />
    </>
  );
};

export default SwitchPortExamination;

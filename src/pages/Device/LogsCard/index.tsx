import * as React from 'react';
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpoint } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CommandHistory from './CommandHistory';
import HealthCheckHistory from './HealthCheckHistory';
import LogHistory from './LogHistory';
import CrashLogs from './LogHistory/CrashLogs';
import RebootLogs from './LogHistory/RebootLogs';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';

type Props = {
  serialNumber: string;
};
const DeviceLogsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabsChange = React.useCallback((index: number) => {
    setTabIndex(index);
  }, []);

  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md' || breakpoint === 'lg';

  return (
    <Card p={0} mb={4}>
      <CardBody p={0}>
        <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed" w="100%">
          <TabList>
            <Tab fontSize="lg" fontWeight="bold">
              {t('controller.devices.commands')}
            </Tab>
            <Tab fontSize="lg" fontWeight="bold">
              {t('controller.devices.healthchecks')}
            </Tab>
            <Tab fontSize="lg" fontWeight="bold">
              {t('controller.devices.logs')}
            </Tab>
            <Tab fontSize="lg" fontWeight="bold">
              {isCompact ? 'Crashes' : t('devices.crash_logs')}
            </Tab>
            <Tab fontSize="lg" fontWeight="bold">
              {isCompact ? 'Reboots' : t('devices.reboot_logs')}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <Box
                borderLeft="1px solid"
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="var(--chakra-colors-chakra-border-color)"
                borderBottomLeftRadius="15px"
                borderBottomRightRadius="15px"
                p={4}
              >
                <CommandHistory serialNumber={serialNumber} />
              </Box>
            </TabPanel>

            <TabPanel>
              <HealthCheckHistory serialNumber={serialNumber} />
            </TabPanel>
            <TabPanel>
              <LogHistory serialNumber={serialNumber} />
            </TabPanel>
            <TabPanel>
              <CrashLogs serialNumber={serialNumber} />
            </TabPanel>
            <TabPanel>
              <RebootLogs serialNumber={serialNumber} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default DeviceLogsCard;

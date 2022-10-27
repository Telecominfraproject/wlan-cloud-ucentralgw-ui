import * as React from 'react';
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CommandHistory from './CommandHistory';
import HealthCheckHistory from './HealthCheckHistory';
import LogHistory from './LogHistory';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';

type Props = {
  serialNumber: string;
};
const DeviceLogsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabsChange = React.useCallback((index: number) => {
    setTabIndex(index);
  }, []);

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
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default DeviceLogsCard;

import React from 'react';
import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Blacklist from './Blacklist';
import DevicesDashboard from './Dashboard';
import DeviceListCard from './ListCard';
import { useAuth } from 'contexts/AuthProvider';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';

const getDefaultTabIndex = () => {
  const index = localStorage.getItem('devices-tab-index') || '0';
  try {
    return parseInt(index, 10);
  } catch {
    return 0;
  }
};

const DevicesPage = () => {
  const { t } = useTranslation();
  const { isUserLoaded } = useAuth();
  const [tabIndex, setTabIndex] = React.useState(getDefaultTabIndex());

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    localStorage.setItem('devices-tab-index', index.toString());
  };

  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded && (
        <Card p={0}>
          <Tabs index={tabIndex} onChange={handleTabChange} variant="enclosed" isLazy>
            <TabList>
              <CardHeader>
                <Tab>{t('analytics.dashboard')}</Tab>
                <Tab>{t('devices.title')}</Tab>
                <Tab>{t('controller.devices.blacklist')}</Tab>
              </CardHeader>
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
                >
                  <DevicesDashboard />
                </Box>
              </TabPanel>
              <TabPanel p={0}>
                <Box
                  borderLeft="1px solid"
                  borderRight="1px solid"
                  borderBottom="1px solid"
                  borderColor="var(--chakra-colors-chakra-border-color)"
                  borderBottomLeftRadius="15px"
                  borderBottomRightRadius="15px"
                >
                  <DeviceListCard />
                </Box>
              </TabPanel>
              <TabPanel p={0}>
                <Box
                  borderLeft="1px solid"
                  borderRight="1px solid"
                  borderBottom="1px solid"
                  borderColor="var(--chakra-colors-chakra-border-color)"
                  borderBottomLeftRadius="15px"
                  borderBottomRightRadius="15px"
                >
                  <Blacklist />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </Flex>
  );
};

export default DevicesPage;

import React from 'react';
import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import FirmwareDashboard from './Dashboard';
import FirmwareListTable from './List';
import { useAuth } from 'contexts/AuthProvider';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { Card } from 'components/Containers/Card';

const STORAGE_KEY = 'firmware-tab-index';

const getDefaultTabIndex = () => {
  const index = localStorage.getItem(STORAGE_KEY) || '0';
  try {
    return parseInt(index, 10);
  } catch {
    return 0;
  }
};

const FirmwarePage = () => {
  const { t } = useTranslation();
  const { isUserLoaded } = useAuth();
  const [tabIndex, setTabIndex] = React.useState(getDefaultTabIndex());

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    localStorage.setItem(STORAGE_KEY, index.toString());
  };

  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded && (
        <Card p={0}>
          <Tabs index={tabIndex} onChange={handleTabChange} variant="enclosed" isLazy>
            <TabList>
              <CardHeader>
                <Tab>{t('analytics.dashboard')}</Tab>
                <Tab>{t('analytics.firmware')}</Tab>
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
                  <FirmwareDashboard />
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
                  <FirmwareListTable />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      )}
    </Flex>
  );
};

export default FirmwarePage;

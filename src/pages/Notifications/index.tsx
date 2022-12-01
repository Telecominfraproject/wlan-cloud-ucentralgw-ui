import React from 'react';
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LogsCard from './DeviceLogs';
import FmsLogsCard from './FmsLogs';
import GeneralLogsCard from './GeneralLogs';
import SecLogsCard from './SecLogs';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';

const INDEX_PARAM = 'notifications-tab-index';

const getDefaultTabIndex = () => {
  const index = localStorage.getItem(INDEX_PARAM) || '0';
  try {
    return parseInt(index, 10);
  } catch {
    return 0;
  }
};

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = React.useState(getDefaultTabIndex());

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    localStorage.setItem(INDEX_PARAM, index.toString());
  };

  return (
    <Card p={0}>
      <Tabs index={tabIndex} onChange={handleTabChange} variant="enclosed" isLazy>
        <TabList>
          <CardHeader>
            <Tab>{t('devices.notifications')}</Tab>
            <Tab>{t('simulation.controller')}</Tab>
            <Tab>{t('logs.security')}</Tab>
            <Tab>{t('logs.firmware')}</Tab>
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
              <LogsCard />
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
              <GeneralLogsCard />
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
              <SecLogsCard />
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
              <FmsLogsCard />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  );
};

export default NotificationsPage;

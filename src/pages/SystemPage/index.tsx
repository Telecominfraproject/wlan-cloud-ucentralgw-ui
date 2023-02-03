import React from 'react';
import { Box, SimpleGrid, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { RefreshButton } from '../../components/Buttons/RefreshButton';
import { SystemSecretsCard } from './SystemSecrets';
import SystemTile from './SystemTile';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { axiosSec } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';
import { useGetEndpoints } from 'hooks/Network/Endpoints';

const getDefaultTabIndex = () => {
  const index = localStorage.getItem('system-tab-index') || '0';
  try {
    return parseInt(index, 10);
  } catch {
    return 0;
  }
};
type Props = {
  isOnlySec?: boolean;
};

const SystemPage = ({ isOnlySec }: Props) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { data: endpoints, refetch, isFetching } = useGetEndpoints({ onSuccess: () => {} });
  const [tabIndex, setTabIndex] = React.useState(getDefaultTabIndex());
  const handleTabChange = (index: number) => {
    setTabIndex(index);
    localStorage.setItem('system-tab-index', index.toString());
  };

  const isRoot = user && user.userRole === 'root';

  const endpointsList = React.useMemo(() => {
    if (!token || (!isOnlySec && !endpoints)) return null;

    const endpointList = endpoints ? [...endpoints] : [];
    endpointList.push({
      uri: axiosSec.defaults.baseURL?.split('/api/v1')[0] ?? '',
      type: isOnlySec ? '' : 'owsec',
      id: 0,
      vendor: 'owsec',
      authenticationType: '',
    });

    return endpointList
      .sort((a, b) => {
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return 0;
      })
      .map((endpoint) => <SystemTile key={uuid()} endpoint={endpoint} token={token} />);
  }, [endpoints, token]);

  return (
    <Card p={0}>
      <Tabs index={tabIndex} onChange={handleTabChange} variant="enclosed" isLazy>
        <TabList>
          <CardHeader>
            <Tab>{t('system.services')}</Tab>
            <Tab hidden={!isRoot}>{t('system.configuration')}</Tab>
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
              {!isOnlySec && (
                <CardHeader px={4} pt={4}>
                  <Spacer />
                  <RefreshButton onClick={refetch} isFetching={isFetching} />
                </CardHeader>
              )}
              <SimpleGrid minChildWidth="500px" spacing="20px" p={4}>
                {endpointsList}
              </SimpleGrid>
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
              <SystemSecretsCard />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  );
};

export default SystemPage;

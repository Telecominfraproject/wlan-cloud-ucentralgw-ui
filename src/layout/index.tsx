import React, { Suspense } from 'react';
import { Center, Flex, Portal, Spinner, useBoolean, useBreakpoint } from '@chakra-ui/react';
import { Route, Routes } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import PanelContainer from './Containers/PanelContainer';
import PanelContent from './Containers/PanelContent';
import MainPanel from './MainPanel';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Route as RouteProps } from 'models/Routes';
import NotFoundPage from 'pages/NotFound';
import routes from 'router/routes';

const Layout = () => {
  const breakpoint = useBreakpoint('xl');
  const [isSidebarOpen, { toggle: toggleSidebar }] = useBoolean(false);
  document.documentElement.dir = 'ltr';

  const getRoutes = (r: RouteProps[]) =>
    // @ts-ignore
    r.map((route: RouteProps) => <Route path={route.path} element={<route.component />} key={uuid()} />);

  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';

  return (
    <>
      <Sidebar routes={routes} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <Portal>
        <Navbar secondary={false} toggleSidebar={toggleSidebar} />
      </Portal>
      <MainPanel w={isCompact ? 'calc(100%)' : 'calc(100% - 210px)'}>
        <PanelContent>
          <PanelContainer>
            <Suspense
              fallback={
                <Flex flexDirection="column" pt="75px">
                  <Center mt={10}>
                    <Spinner />
                  </Center>
                </Flex>
              }
            >
              <Routes>
                {[...getRoutes(routes as RouteProps[]), <Route path="*" element={<NotFoundPage />} key={uuid()} />]}
              </Routes>
            </Suspense>
          </PanelContainer>
        </PanelContent>
      </MainPanel>
    </>
  );
};

export default Layout;

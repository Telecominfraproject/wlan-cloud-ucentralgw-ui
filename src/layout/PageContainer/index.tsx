import * as React from 'react';
import { Box, Center, Flex, Spinner, useBreakpoint } from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthProvider';

export type PageContainerProps = {
  waitForUser: boolean;
  children: React.ReactNode;
};

export const PageContainer = ({ waitForUser, children }: PageContainerProps) => {
  const { isUserLoaded } = useAuth();
  const breakpoint = useBreakpoint('xl');
  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';

  return (
    <Box
      w={isCompact ? 'calc(100%)' : 'calc(100% - 210px)'}
      float="right"
      position="relative"
      transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
      transitionDelay=".2s, .2s, .35s"
      transitionProperty="top, bottom, width"
      transitionTimingFunction="linear, linear, ease"
      px="15px"
      pb="15px"
    >
      <Box minH="calc(100vh - 123px)" pt="105px" pl="10px" pr="5px" pb="0px">
        <Flex flexDirection="column">
          <React.Suspense
            fallback={
              <Center mt="100px">
                <Spinner size="xl" />
              </Center>
            }
          >
            {waitForUser && !isUserLoaded ? (
              <Center mt="100px">
                <Spinner size="xl" />
              </Center>
            ) : (
              children
            )}
          </React.Suspense>
        </Flex>
      </Box>
    </Box>
  );
};

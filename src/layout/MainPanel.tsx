import React from 'react';
import { Box, LayoutProps, useStyleConfig } from '@chakra-ui/react';

interface Props extends LayoutProps {
  children: React.ReactNode;
}

const MainPanel: React.FC<Props> = ({ children, ...props }) => {
  const styles = useStyleConfig('MainPanel');

  return (
    <Box __css={styles} mb="16px" {...props}>
      {children}
    </Box>
  );
};

export default MainPanel;

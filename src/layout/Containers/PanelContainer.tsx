import React, { ReactNode } from 'react';
import { Box, useStyleConfig } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

const PanelContainer: React.FC<Props> = ({ children }) => {
  const styles = useStyleConfig('PanelContainer');
  // Pass the computed styles into the `__css` prop
  return <Box __css={styles}>{children}</Box>;
};

export default PanelContainer;

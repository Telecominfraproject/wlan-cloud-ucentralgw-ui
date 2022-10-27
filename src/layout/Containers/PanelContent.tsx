import React, { ReactNode } from 'react';
import { Box, useStyleConfig } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

const PanelContent: React.FC<Props> = ({ children }) => {
  const styles = useStyleConfig('PanelContent');

  return <Box __css={styles}>{children}</Box>;
};

export default PanelContent;

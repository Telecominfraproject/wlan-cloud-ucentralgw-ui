import React from 'react';
import { Box, LayoutProps, SpaceProps, useStyleConfig } from '@chakra-ui/react';

export interface CardHeaderProps extends LayoutProps, SpaceProps {
  variant?: string;
  children: React.ReactNode;
}

const _CardHeader: React.FC<CardHeaderProps> = ({ variant, children, ...rest }) => {
  // @ts-ignore
  const styles = useStyleConfig('CardHeader', { variant });
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
};

export const CardHeader = React.memo(_CardHeader);

import React from 'react';
import { Box, LayoutProps, SpaceProps, useStyleConfig } from '@chakra-ui/react';

export interface CardBodyProps extends LayoutProps, SpaceProps {
  variant?: string;
  children: React.ReactNode;
}

const _CardBody: React.FC<CardBodyProps> = ({ variant, children, ...props }) => {
  // @ts-ignore
  const styles = useStyleConfig('CardBody', { variant });
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...props}>
      {children}
    </Box>
  );
};

export const CardBody = React.memo(_CardBody);

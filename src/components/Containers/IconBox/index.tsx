import React from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';

interface Props extends FlexProps {
  children: React.ReactNode;
}

const IconBox = ({ children, ...rest }: Props) => (
  <Flex alignItems="center" justifyContent="center" borderRadius="12px" {...rest}>
    {children}
  </Flex>
);

export default IconBox;

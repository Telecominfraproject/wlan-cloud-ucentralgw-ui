import React from 'react';
import { Flex } from '@chakra-ui/react';

type Props = {
  children: React.ReactNode;
};

const IconBox = ({ children, ...rest }: Props) => (
  <Flex alignItems="center" justifyContent="center" borderRadius="12px" {...rest}>
    {children}
  </Flex>
);

export default IconBox;

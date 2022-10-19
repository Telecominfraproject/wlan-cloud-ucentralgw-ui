import React from 'react';
import { Flex, LayoutProps, ModalHeader as Header, SpaceProps, Spacer } from '@chakra-ui/react';

export interface ModalHeaderProps extends LayoutProps, SpaceProps {
  title: string;
  right?: React.ReactNode;
}

export const ModalHeader = ({ title, right }: ModalHeaderProps) => (
  <Header>
    <Flex justifyContent="center" alignItems="center" maxW="100%" px={1}>
      {title}
      <Spacer />
      {right}
    </Flex>
  </Header>
);

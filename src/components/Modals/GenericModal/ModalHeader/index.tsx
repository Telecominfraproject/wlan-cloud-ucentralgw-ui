import React from 'react';
import { Flex, ModalHeader as Header, Spacer } from '@chakra-ui/react';

export interface ModalHeaderProps {
  title: string;
  right: React.ReactNode;
}

const _ModalHeader: React.FC<ModalHeaderProps> = ({ title, right }) => (
  <Header>
    <Flex justifyContent="center" alignItems="center" maxW="100%" px={1}>
      {title}
      <Spacer />
      {right}
    </Flex>
  </Header>
);

export const ModalHeader = React.memo(_ModalHeader);

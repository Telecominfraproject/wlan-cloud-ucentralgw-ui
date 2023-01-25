import React from 'react';
import { Flex, HStack, ModalHeader as Header, Spacer } from '@chakra-ui/react';

export interface ModalHeaderProps {
  title: string;
  left?: React.ReactNode;
  right: React.ReactNode;
}

const _ModalHeader: React.FC<ModalHeaderProps> = ({ title, left, right }) => (
  <Header>
    <Flex justifyContent="center" alignItems="center" maxW="100%" px={1}>
      {title}
      <HStack spacing={2} ml={2}>
        {left ?? null}
      </HStack>
      <Spacer />
      {right}
    </Flex>
  </Header>
);

export const ModalHeader = React.memo(_ModalHeader);

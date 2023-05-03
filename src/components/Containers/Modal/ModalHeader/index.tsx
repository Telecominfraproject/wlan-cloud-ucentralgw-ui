import React from 'react';
import { HStack, ModalHeader as Header, Spacer, useColorModeValue } from '@chakra-ui/react';

export interface ModalHeaderProps {
  title: string;
  left?: React.ReactNode;
  right: React.ReactNode;
}

const _ModalHeader: React.FC<ModalHeaderProps> = ({ title, left, right }) => {
  const bg = useColorModeValue('blue.50', 'blue.700');

  return (
    <Header bg={bg}>
      {title}
      {left ? (
        <HStack spacing={2} ml={2}>
          {left}
        </HStack>
      ) : null}
      <Spacer />
      {right}
    </Header>
  );
};
export const ModalHeader = React.memo(_ModalHeader);

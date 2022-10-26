import * as React from 'react';
import { HStack, LayoutProps, Modal as ChakraModal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { ModalHeader } from '../GenericModal/ModalHeader';
import { CloseButton } from 'components/Buttons/CloseButton';

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  topRightButtons?: React.ReactNode;
  options?: {
    modalSize?: 'sm' | 'md' | 'lg';
    maxWidth?: LayoutProps['maxWidth'];
  };
  children: React.ReactElement;
};

const _Modal = ({ isOpen, onClose, title, topRightButtons, options, children }: ModalProps) => {
  const maxWidth = React.useMemo(() => {
    if (options?.maxWidth) return options.maxWidth;
    if (options?.modalSize === 'sm') return undefined;
    if (options?.modalSize === 'lg') {
      return { sm: '90%', md: '900px', lg: '1000px', xl: '80%' };
    }

    return { sm: '600px', md: '700px', lg: '800px', xl: '50%' };
  }, []);

  return (
    <ChakraModal onClose={onClose} isOpen={isOpen} size={options?.modalSize === 'sm' ? 'sm' : 'xl'}>
      <ModalOverlay />
      <ModalContent maxWidth={maxWidth}>
        <ModalHeader
          title={title}
          right={
            <HStack spacing={2}>
              {topRightButtons}
              <CloseButton onClick={onClose} />
            </HStack>
          }
        />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  );
};

export const Modal = React.memo(_Modal);

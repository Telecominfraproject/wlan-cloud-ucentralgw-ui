import { ComponentStyleConfig } from '@chakra-ui/react';

export const Alert: ComponentStyleConfig = {
  baseStyle: {
    container: {
      borderRadius: '15px',
    },
  },
};

export const Badge: ComponentStyleConfig = {
  sizes: {
    md: {
      width: '65px',
      height: '25px',
    },
  },
  baseStyle: {
    textTransform: 'capitalize',
  },
};

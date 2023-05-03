import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  header: {
    mb: 2,
    borderBottom: '0.5px solid',
    borderTopRadius: '15px',
    py: 0,
    minH: '58px',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    // A little bit of shadow under
    boxShadow: 'sm',
  },
  dialog: {
    borderRadius: '15px',
    border: '1px solid',
  },
});

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

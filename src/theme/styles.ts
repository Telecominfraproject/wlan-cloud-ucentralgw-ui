import { mode } from '@chakra-ui/theme-tools';

export default {
  colors: {
    gray: {
      700: '#1f2733',
    },
    success: {
      50: '#deffef',
      100: '#b4f8d6',
      200: '#89f3bd',
      300: '#5deda3',
      400: '#31e88a',
      500: '#17ce71',
      600: '#0ba057',
      700: '#02733e',
      800: '#004624',
      900: '#001908',
    },
    warning: {
      50: '#feffdc',
      100: '#fbffaf',
      200: '#f9ff7e',
      300: '#f6ff4d',
      400: '#f4ff1f',
      500: '#dae609',
      600: '#aab300',
      700: '#798000',
      800: '#494d00',
      900: '#181b00',
    },
    danger: {
      50: '#FFE6E9',
      100: '#FEB8C1',
      200: '#FE8B99',
      300: '#FD5D71',
      400: '#FD3049',
      500: '#FD0221',
      600: '#CA021A',
      700: '#980114',
      800: '#65010D',
      900: '#330007',
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: mode('gray.50', 'gray.800')(props),
        fontFamily: 'Inter, sans-serif',
      },
      html: {
        fontFamily: 'Inter, sans-serif',
      },
    }),
  },
};

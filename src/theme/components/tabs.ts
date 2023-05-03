import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys);

// define custom sizes
const sizes = {
  md: definePartsStyle(({ colorMode }) => {
    const isLight = colorMode === 'light';

    return {
      // define the parts that will change for each size
      tab: {
        fontSize: 'lg',
        py: '2',
        px: '4',
        fontWeight: 'normal',
        color: isLight ? 'gray.500' : 'gray.400',
        borderWidth: '0.5px',
        _selected: {
          borderColor: 'unset',
          textColor: isLight ? 'gray.800' : 'white',
          fontWeight: 'semibold',
          // borderTopRadius: '15px',
          borderTopColor: isLight ? 'black' : 'white',
          borderLeftColor: isLight ? 'black' : 'white',
          borderRightColor: isLight ? 'black' : 'white',
          marginTop: '-0.5px',
          marginLeft: '-0.5px',
          borderWidth: '0.5px',
          borderBottom: '2px solid',
        },
      },
      tablist: {
        borderColor: 'black',
        borderBottom: '0.5px solid black !important',
        borderBottomWidth: '0.5px',
        marginTop: '10px',
        paddingLeft: '10px',
      },
    };
  }),
};

// export the component theme
export const tabsTheme = defineMultiStyleConfig({ sizes });

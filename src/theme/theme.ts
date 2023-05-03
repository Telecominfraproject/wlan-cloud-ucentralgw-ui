import { extendTheme, type ThemeConfig, Tooltip } from '@chakra-ui/react';
import CardComponent from './additions/card/Card';
import CardBodyComponent from './additions/card/CardBody';
import CardHeaderComponent from './additions/card/CardHeader';
import { Alert, Badge } from './components';
import buttonStyles from './components/button';
import drawerStyles from './components/drawer';
import { modalTheme } from './components/modal';
import { tabsTheme } from './components/tabs';
import breakpoints from './foundations/breakpoints';
import font from './foundations/fonts';
import globalStyles from './styles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  font,
  breakpoints,
  colors: globalStyles.colors,
  styles: globalStyles.styles,
  components: {
    Alert,
    Badge,
    Button: buttonStyles.components.Button,
    Drawer: drawerStyles.components.Drawer,
    Card: CardComponent.components.Card,
    CardBody: CardBodyComponent.components.CardBody,
    CardHeader: CardHeaderComponent.components.CardHeader,
    Modal: modalTheme,
    Tabs: tabsTheme,
  },
});

Tooltip.defaultProps = { ...Tooltip.defaultProps, hasArrow: true };

export default theme;

import React, { DOMAttributes } from 'react';
import {
  BackgroundProps,
  Box,
  EffectProps,
  InteractivityProps,
  LayoutProps,
  PositionProps,
  SpaceProps,
  useColorModeValue,
  useStyleConfig,
  useToken,
} from '@chakra-ui/react';

export interface CardHeaderProps
  extends LayoutProps,
    SpaceProps,
    BackgroundProps,
    InteractivityProps,
    PositionProps,
    EffectProps,
    DOMAttributes<HTMLDivElement> {
  variant?: 'panel' | 'unstyled';
  children: React.ReactNode;
  icon?: React.ReactNode;
  headerStyle?: {
    color: string;
  };
}

const _CardHeader: React.FC<CardHeaderProps> = ({
  variant,
  children,
  icon,
  headerStyle = {
    color: 'blue',
  },
  ...rest
}) => {
  const iconBgcolor = useToken('colors', [`${headerStyle?.color}.500`, `${headerStyle?.color}.300`]);
  const bgColor = useToken('colors', [`${headerStyle?.color}.50`, `${headerStyle?.color}.700`]);
  const iconColor = useColorModeValue(iconBgcolor[0], iconBgcolor[1]);
  const headerBgColor = useColorModeValue(bgColor[0], bgColor[1]);

  const styles = useStyleConfig('CardHeader', { variant });

  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} bgColor={variant === 'unstyled' ? undefined : headerBgColor} {...rest}>
      {icon ? (
        <Box mr={2} color={headerStyle ? iconColor : undefined} bgColor="unset">
          {icon}
        </Box>
      ) : null}
      {children}
    </Box>
  );
};

export const CardHeader = React.memo(_CardHeader);

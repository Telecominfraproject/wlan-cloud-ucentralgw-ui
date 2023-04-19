import * as React from 'react';
import { As, Icon, Tag, TagLabel, TagLeftIcon, TagProps, Tooltip, useBreakpoint } from '@chakra-ui/react';

export interface ResponsiveTagProps extends TagProps {
  label: string;
  icon: As<any>;
  tooltip?: string;
  isCompact?: boolean;
}

export const ResponsiveTag = React.memo(({ label, icon, tooltip, isCompact, ...props }: ResponsiveTagProps) => {
  const breakpoint = useBreakpoint();

  const isCompactVersion = isCompact || breakpoint === 'base' || breakpoint === 'sm';

  if (isCompactVersion) {
    return (
      <Tooltip label={tooltip ?? label}>
        <Tag size="lg" colorScheme="blue" {...props}>
          <Icon as={icon} boxSize="18px" />
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltip ?? label}>
      <Tag size="lg" colorScheme="blue" {...props}>
        <TagLeftIcon boxSize="18px" as={icon} />
        <TagLabel>{label}</TagLabel>
      </Tag>
    </Tooltip>
  );
});

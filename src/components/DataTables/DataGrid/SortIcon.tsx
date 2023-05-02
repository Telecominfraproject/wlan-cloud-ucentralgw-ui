import React from 'react';
import { Icon } from '@chakra-ui/react';
import { ArrowDown, ArrowUp, Circle } from '@phosphor-icons/react';
import { SortDirection } from '@tanstack/react-table';

export type DataGridSortIconProps = {
  sortInfo: false | SortDirection;
  canSort: boolean;
};

export const DataGridSortIcon = ({ sortInfo, canSort }: DataGridSortIconProps) => {
  if (canSort) {
    if (sortInfo) {
      return sortInfo === 'desc' ? (
        <Icon ml={1} boxSize={3} as={ArrowDown} />
      ) : (
        <Icon ml={1} boxSize={3} as={ArrowUp} />
      );
    }
    return <Icon ml={1} boxSize={3} as={Circle} />;
  }
  return null;
};

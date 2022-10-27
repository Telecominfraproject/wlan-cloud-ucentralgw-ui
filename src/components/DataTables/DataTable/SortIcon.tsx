import React from 'react';
import { Icon } from '@chakra-ui/react';
import { ArrowDown, ArrowUp, Circle } from 'phosphor-react';

interface Props {
  isSorted: boolean;
  isSortedDesc?: boolean;
  canSort: boolean;
}

const defaultProps = {
  isSortedDesc: false,
};

const SortIcon: React.FC<Props> = ({ isSorted, isSortedDesc, canSort }) => {
  if (canSort) {
    if (isSorted) {
      return isSortedDesc ? <Icon pt={2} h={5} w={5} as={ArrowDown} /> : <Icon pt={2} h={5} w={5} as={ArrowUp} />;
    }
    return <Icon pt={2} h={5} w={5} as={Circle} />;
  }
  return null;
};

SortIcon.defaultProps = defaultProps;
export default React.memo(SortIcon);

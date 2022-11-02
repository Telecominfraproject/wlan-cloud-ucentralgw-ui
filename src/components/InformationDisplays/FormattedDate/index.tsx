import React from 'react';
import { Tooltip } from '@chakra-ui/react';
import { compactDate, formatDaysAgo } from 'helpers/dateFormatting';

type Props = { date?: number; hidePrefix?: boolean };

const getDaysAgo = ({ date, hidePrefix }: { date?: number; hidePrefix?: boolean }) => {
  if (!date || date === 0) return '-';

  return hidePrefix ? formatDaysAgo(date).split(' ').slice(1).join(' ') : formatDaysAgo(date);
};

const FormattedDate = ({ date, hidePrefix }: Props) => (
  <Tooltip hasArrow placement="top" label={compactDate(date ?? 0)}>
    {getDaysAgo({ date, hidePrefix })}
  </Tooltip>
);

export default React.memo(FormattedDate);

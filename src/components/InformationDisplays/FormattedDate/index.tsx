import React from 'react';
import { Tooltip } from '@chakra-ui/react';
import { compactDate, formatDaysAgo, formatDaysAgoCompact } from 'helpers/dateFormatting';

type Props = { date?: number; hidePrefix?: boolean; isCompact?: boolean };

const getDaysAgo = ({ date, hidePrefix, isCompact }: { date?: number; hidePrefix?: boolean; isCompact?: boolean }) => {
  if (!date || date === 0) return '-';
  if (isCompact)
    return hidePrefix ? formatDaysAgoCompact(date).split(' ').slice(1).join(' ') : formatDaysAgoCompact(date);
  return hidePrefix ? formatDaysAgo(date).split(' ').slice(1).join(' ') : formatDaysAgo(date);
};

const FormattedDate = ({ date, hidePrefix, isCompact }: Props) => (
  <Tooltip hasArrow placement="top" label={compactDate(date ?? 0)}>
    {getDaysAgo({ date, hidePrefix, isCompact })}
  </Tooltip>
);

export default React.memo(FormattedDate);

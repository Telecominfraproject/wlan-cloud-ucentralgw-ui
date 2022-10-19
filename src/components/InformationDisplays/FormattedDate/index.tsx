import React from 'react';
import { Tooltip } from '@chakra-ui/react';
import { compactDate, formatDaysAgo } from 'helpers/dateFormatting';

const FormattedDate: React.FC<{ date: number }> = ({ date }) => (
  <Tooltip hasArrow placement="top" label={compactDate(date)}>
    {date === 0 ? '-' : formatDaysAgo(date)}
  </Tooltip>
);

export default React.memo(FormattedDate);

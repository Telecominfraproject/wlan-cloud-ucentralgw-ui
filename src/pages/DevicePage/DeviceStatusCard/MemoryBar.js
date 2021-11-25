import React from 'react';
import { CPopover, CProgress, CProgressBar } from '@coreui/react';
import PropTypes from 'prop-types';
import { cleanBytesString } from 'utils/helper';

const MemoryBar = ({ t, usedBytes, totalBytes }) => {
  const used = cleanBytesString(usedBytes);
  const total = cleanBytesString(totalBytes);
  const percentage = Math.floor((usedBytes / totalBytes) * 100);

  return (
    <CPopover content={t('status.used_total_memory', { used, total })}>
      <CProgress>
        <CProgressBar value={percentage}>
          {percentage >= 25 ? t('status.percentage_used', { percentage, total }) : ''}
        </CProgressBar>
        <CProgressBar value={100 - percentage} color="transparent">
          <div style={{ color: 'black' }}>
            {percentage < 25
              ? t('status.percentage_free', { percentage: 100 - percentage, total })
              : ''}
          </div>
        </CProgressBar>
      </CProgress>
    </CPopover>
  );
};

MemoryBar.propTypes = {
  t: PropTypes.func.isRequired,
  usedBytes: PropTypes.number.isRequired,
  totalBytes: PropTypes.number.isRequired,
};

export default React.memo(MemoryBar);

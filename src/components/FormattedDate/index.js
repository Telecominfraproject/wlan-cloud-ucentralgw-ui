import React from 'react';
import PropTypes from 'prop-types';
import { CPopover } from '@coreui/react';
import { formatDaysAgo, prettyDate } from 'utils/helper';

const FormattedDate = ({ date, size }) => {
  if (size === 'lg') {
    return (
      <CPopover content={prettyDate(date)} advancedOptions={{ animation: false }}>
        <h2 className="d-inline-block">{date === 0 ? '-' : formatDaysAgo(date)}</h2>
      </CPopover>
    );
  }

  return (
    <CPopover content={prettyDate(date)} advancedOptions={{ animation: false }}>
      <span className="d-inline-block">{date === 0 ? '-' : formatDaysAgo(date)}</span>
    </CPopover>
  );
};

FormattedDate.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.string,
};

FormattedDate.defaultProps = {
  date: 0,
  size: 'md',
};

export default FormattedDate;

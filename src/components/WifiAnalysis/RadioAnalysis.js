import React from 'react';
import PropTypes from 'prop-types';
import { CDataTable } from '@coreui/react';

const RadioAnalysisTable = ({ data, loading }) => {
  const columns = [
    { key: 'radio', label: '#', _style: { width: '5%' } },
    { key: 'channel', label: 'Ch', _style: { width: '5%' } },
    { key: 'channelWidth', label: 'C Width', _style: { width: '7%' }, sorter: false },
    { key: 'noise', label: 'Noise', _style: { width: '4%' }, sorter: false },
    { key: 'txPower', label: 'Tx Power', _style: { width: '9%' }, sorter: false },
    { key: 'activeMs', label: 'Active MS', _style: { width: '23%' }, sorter: false },
    { key: 'busyMs', label: 'Busy MS', _style: { width: '23%' }, sorter: false },
    { key: 'receiveMs', label: 'Receive MS', _style: { width: '23%' }, sorter: false },
  ];

  const centerIfEmpty = (value) => (
    <td className={!value || value === '' || value === '-' ? 'text-center' : ''}>{value}</td>
  );

  return (
    <CDataTable
      addTableClasses="table-sm"
      fields={columns}
      items={data}
      hover
      border
      loading={loading}
      sorter
      sorterValue={{ column: 'radio', asc: true }}
      scopedSlots={{
        noise: (item) => centerIfEmpty(item.noise),
      }}
    />
  );
};

RadioAnalysisTable.propTypes = {
  data: PropTypes.instanceOf(Object).isRequired,
  loading: PropTypes.bool.isRequired,
};
export default RadioAnalysisTable;

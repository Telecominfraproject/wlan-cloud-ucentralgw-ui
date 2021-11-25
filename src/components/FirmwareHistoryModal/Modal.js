import React from 'react';
import PropTypes from 'prop-types';
import { CDataTable } from '@coreui/react';
import { prettyDate } from 'utils/helper';

const FirmwareHistoryModal = ({ t, loading, data }) => {
  const columns = [
    { key: 'date', label: '#', _style: { width: '20%' } },
    { key: 'fromRelease', label: t('firmware.from_release'), sorter: false },
    { key: 'toRelease', label: t('firmware.to_release'), sorter: false },
  ];

  return (
    <CDataTable
      addTableClasses="ignore-overflow table-sm"
      fields={columns}
      items={data}
      hover
      border
      loading={loading}
      sorter
      sorterValue={{ column: 'radio', asc: true }}
      scopedSlots={{
        date: (item) => <td>{prettyDate(item.upgraded)}</td>,
      }}
    />
  );
};

FirmwareHistoryModal.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.instanceOf(Array).isRequired,
};

export default React.memo(FirmwareHistoryModal);

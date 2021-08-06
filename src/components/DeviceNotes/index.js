import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CDataTable, CRow, CCol, CLabel, CInput } from '@coreui/react';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axiosInstance';
import { prettyDate } from 'utils/helper';
import { LoadingButton, useAuth } from 'ucentral-libs';

import styles from './index.module.scss';

const DeviceNotes = ({ serialNumber, notes, refreshNotes }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [currentNote, setCurrentNote] = useState('');
  const [loading, setLoading] = useState(false);

  const saveNote = () => {
    setLoading(true);

    const parameters = {
      serialNumber,
      notes: [{ note: currentNote }],
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .put(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(serialNumber)}`,
        parameters,
        { headers },
      )
      .then(() => {
        setCurrentNote('');
        refreshNotes();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };
  const columns = [
    { key: 'created', label: t('common.date'), _style: { width: '30%' } },
    { key: 'createdBy', label: t('common.created_by'), _style: { width: '20%' } },
    { key: 'note', label: t('configuration.note'), _style: { width: '50%' } },
  ];

  return (
    <div>
      <CRow className={styles.spacedRow}>
        <CCol md="3">
          <CLabel>{t('configuration.notes')} :</CLabel>
        </CCol>
        <CCol xs="9" md="7">
          <CInput
            id="notes-input"
            name="text-input"
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
          />
        </CCol>
        <CCol>
          <LoadingButton
            label={t('common.add')}
            isLoadingLabel={t('common.adding_ellipsis')}
            isLoading={loading}
            action={saveNote}
            disabled={loading || currentNote === ''}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="3" />
        <CCol xs="12" md="9">
          <div className={['overflow-auto', styles.scrollableBox].join(' ')}>
            <CDataTable
              striped
              responsive
              border
              loading={loading}
              fields={columns}
              className={styles.table}
              items={notes || []}
              noItemsView={{ noItems: t('common.no_items') }}
              sorterValue={{ column: 'created', desc: 'true' }}
              scopedSlots={{
                created: (item) => (
                  <td>
                    {item.created && item.created !== 0 ? prettyDate(item.created) : t('common.na')}
                  </td>
                ),
              }}
            />
          </div>
        </CCol>
      </CRow>
    </div>
  );
};

DeviceNotes.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  notes: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired,
  refreshNotes: PropTypes.func.isRequired,
};

export default DeviceNotes;

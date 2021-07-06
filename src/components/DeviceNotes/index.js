import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CDataTable, CRow, CCol, CLabel, CInput } from '@coreui/react';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'contexts/AuthProvider';
import LoadingButton from 'components/LoadingButton';

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
      notes: currentNote,
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
        refreshNotes();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };
  const columns = [
    { key: 'created', label: t('common.date'), _style: { width: '20%' } },
    { key: 'createdBy', label: t('common.created_by'), _style: { width: '20%' } },
    { key: 'note', label: t('configuration.note'), _style: { width: '60%' } },
  ];

  return (
    <div>
      <CRow className={styles.spacedRow}>
        <CCol md="3">
          <CLabel>{t('configuration.notes')} :</CLabel>
        </CCol>
        <CCol xs="10" md="8">
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
            block
            disabled={loading || currentNote === ''}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="3" />
        <CCol xs="12" md="9">
          <div className={['overflow-auto', styles.scrollableBox].join(' ')}>
            <CDataTable
              loading={loading}
              fields={columns}
              className={styles.table}
              items={!notes || []}
            />
          </div>
        </CCol>
      </CRow>
    </div>
  );
};

DeviceNotes.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  notes: PropTypes.string.isRequired,
  refreshNotes: PropTypes.func.isRequired,
};

export default DeviceNotes;

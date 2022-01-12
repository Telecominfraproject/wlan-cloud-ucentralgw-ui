import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CCard, CCardHeader, CCardBody, CPopover, CButton } from '@coreui/react';
import { cilPencil, cilX, cilSave } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useTranslation } from 'react-i18next';
import { DetailedNotesTable, useAuth, useToast, useToggle } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

const NotesTab = ({ deviceConfig, refresh }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints, user } = useAuth();
  const { addToast } = useToast();
  const [editing, toggleEditing, setEditing] = useToggle(false);
  const [loading, setLoading] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(deviceConfig.notes);

  const stopEditing = () => {
    setEditing(false);
    refresh();
  };

  const addNote = (currentNote) => {
    const newNotes = currentNotes;
    newNotes.unshift({
      note: currentNote,
      new: true,
      created: new Date().getTime() / 1000,
      createdBy: user?.email ?? '',
    });
    setCurrentNotes([...newNotes]);
  };

  const save = () => {
    setLoading(true);

    const newNotes = [];
    for (let i = 0; i < currentNotes.length; i += 1) {
      if (currentNotes[i].new) newNotes.push({ note: currentNotes[i].note });
    }

    const parameters = {
      id: deviceConfig.serialNumber,
      notes: newNotes,
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.owgw}/api/v1/device/${deviceConfig.serialNumber}`, parameters, options)
      .then(() => {
        addToast({
          title: t('firmware.update_success_title'),
          body: t('firmware.update_success'),
          color: 'success',
          autohide: true,
        });
        refresh();
        toggleEditing();
      })
      .catch((e) => {
        addToast({
          title: t('firmware.update_failure_title'),
          body: t('firmware.update_failure', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setCurrentNotes(deviceConfig.notes);
  }, [deviceConfig.notes]);

  return (
    <div>
      <CCard className="m-0">
        <CCardHeader className="dark-header">
          <div className="d-flex flex-row-reverse align-items-center">
            <div className="pl-2">
              <CPopover content={t('common.save')}>
                <CButton className="ml-2" size="sm" color="info" onClick={save} disabled={!editing}>
                  <CIcon content={cilSave} />
                </CButton>
              </CPopover>
              <CPopover content={t('common.edit')}>
                <CButton
                  className="ml-2"
                  size="sm"
                  color="dark"
                  onClick={toggleEditing}
                  disabled={editing}
                >
                  <CIcon content={cilPencil} />
                </CButton>
              </CPopover>
              <CPopover content={t('common.stop_editing')}>
                <CButton
                  className="ml-2"
                  size="sm"
                  color="dark"
                  onClick={stopEditing}
                  disabled={!editing}
                >
                  <CIcon content={cilX} />
                </CButton>
              </CPopover>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <DetailedNotesTable
            t={t}
            notes={currentNotes}
            addNote={addNote}
            loading={loading}
            editable={editing}
          />
        </CCardBody>
      </CCard>
    </div>
  );
};

NotesTab.propTypes = {
  deviceConfig: PropTypes.instanceOf(Object).isRequired,
  refresh: PropTypes.func.isRequired,
};

export default NotesTab;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CPopover,
  CNav,
  CNavLink,
  CTabPane,
  CTabContent,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilSave, cilX } from '@coreui/icons';
import axiosInstance from 'utils/axiosInstance';
import { useFormFields, useAuth, useToast, DetailedNotesTable } from 'ucentral-libs';
import Form from './Form';

const initialState = {
  created: {
    value: '',
    error: false,
    editable: false,
  },
  release: {
    value: false,
    error: false,
    editable: false,
  },
  image: {
    value: '',
    error: false,
    editable: true,
  },
  imageDate: {
    value: '',
    error: false,
    editable: true,
  },
  size: {
    value: '',
    error: false,
    editable: true,
  },
  revision: {
    value: '',
    error: false,
    editable: false,
  },
  uri: {
    value: '',
    error: false,
    editable: true,
  },
  description: {
    value: '',
    error: false,
    editable: true,
  },
  notes: {
    value: [],
    editable: false,
  },
};

const EditFirmwareModal = ({ show, toggle, firmwareId, refreshTable }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [index, setIndex] = useState(0);
  const [firmware, updateWithId, updateWithKey, setFirmware] = useFormFields(initialState);

  const getFirmware = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owfms}/api/v1/firmware/${firmwareId}`, options)
      .then((response) => {
        const newFirmware = {};

        for (const key of Object.keys(response.data)) {
          if (key in initialState && key !== 'currentPassword') {
            newFirmware[key] = {
              ...initialState[key],
              value: response.data[key],
            };
          }
        }
        setFirmware({ ...initialState, ...newFirmware });
      })
      .catch(() => {});
  };

  const toggleEditing = () => {
    if (editing) {
      getFirmware();
    }
    setEditing(!editing);
  };

  const toggleModal = () => {
    toggleEditing();
    toggle();
  };

  const updateFirmware = () => {
    setLoading(true);

    const parameters = {
      id: firmwareId,
      description: firmware.description.value,
    };

    const newNotes = [];
    for (let i = 0; i < firmware.notes.value.length; i += 1) {
      if (firmware.notes.value[i].new) newNotes.push({ note: firmware.notes.value[i].note });
    }

    parameters.notes = newNotes;

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.owfms}/api/v1/firmware/${firmwareId}`, parameters, options)
      .then(() => {
        addToast({
          title: t('firmware.update_success_title'),
          body: t('firmware.update_success'),
          color: 'success',
          autohide: true,
        });
        refreshTable();
        toggle();
      })
      .catch((e) => {
        addToast({
          title: t('firmware.update_failure_title'),
          body: t('firmware.update_failure', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        getFirmware();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addNote = (currentNote) => {
    const newNotes = [...firmware.notes.value];
    newNotes.unshift({
      note: currentNote,
      new: true,
      created: new Date().getTime() / 1000,
      createdBy: '',
    });
    updateWithKey('notes', { value: newNotes });
  };

  useEffect(() => {
    if (show) {
      getFirmware();
      setEditing(false);
      setIndex(0);
    }
  }, [show]);

  return (
    <CModal show={show} onClose={toggle} size="xl">
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">
          {t('firmware.details_title', { image: firmware.image.value })}
        </CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.save')}>
            <CButton color="primary" variant="outline" onClick={updateFirmware} disabled={loading}>
              <CIcon content={cilSave} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.edit')}>
            <CButton
              disabled={editing}
              color="primary"
              variant="outline"
              onClick={toggleEditing}
              className="ml-2"
            >
              <CIcon name="cil-pencil" content={cilPencil} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggleModal}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody className="px-3 pt-0">
        <CNav variant="tabs" className="mb-0 p-0">
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 0}
            onClick={() => setIndex(0)}
          >
            {t('common.main')}
          </CNavLink>
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 1}
            onClick={() => setIndex(1)}
          >
            {t('configuration.notes')}
          </CNavLink>
        </CNav>
        <CTabContent>
          <CTabPane active={index === 0} className="pt-2">
            {index === 0 ? (
              <Form t={t} fields={firmware} updateFieldsWithId={updateWithId} editing={editing} />
            ) : null}
          </CTabPane>
          <CTabPane active={index === 1}>
            {index === 1 ? (
              <DetailedNotesTable
                t={t}
                notes={firmware.notes.value}
                addNote={addNote}
                loading={loading}
                editable={editing}
              />
            ) : null}
          </CTabPane>
        </CTabContent>
      </CModalBody>
    </CModal>
  );
};

EditFirmwareModal.propTypes = {
  firmwareId: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  refreshTable: PropTypes.func.isRequired,
};

export default React.memo(EditFirmwareModal);

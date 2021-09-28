import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CPopover } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX, cilSave } from '@coreui/icons';
import { useFormFields, useAuth, useToast, useEntity, EditInventoryTagForm } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { useTranslation } from 'react-i18next';

const initialForm = {
  entity: {
    value: '',
    error: false,
    hidden: false,
    ignore: true,
  },
  serialNumber: {
    value: '',
    error: false,
    required: true,
    regex: '^[a-fA-F0-9]+$',
    length: 12,
    ignore: true,
  },
  name: {
    value: '',
    error: false,
    required: true,
  },
  description: {
    value: '',
    error: false,
  },
  deviceType: {
    value: '',
    error: false,
    required: true,
  },
  rrm: {
    value: 'inherit',
    error: false,
    required: true,
  },
  deviceConfiguration: {
    value: '',
    uuid: '',
    error: false,
    ignore: true,
  },
  venue: {
    value: '',
    error: false,
  },
  notes: {
    value: [],
    error: false,
    ignore: true,
  },
};

const EditTagModal = ({ show, toggle, tagSerialNumber, refreshTable }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceTypes } = useEntity();
  const { addToast } = useToast();
  const [fields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialForm);
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState({});

  const validation = () => {
    let success = true;

    for (const [key, field] of Object.entries(fields)) {
      if (field.required && field.value === '') {
        updateField(key, { error: true });
        success = false;
        break;
      }
    }

    return success;
  };

  const getTag = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owprov}/api/v1/inventory/${tagSerialNumber}`, options)
      .then((response) => {
        const newFields = fields;
        for (const [key] of Object.entries(newFields)) {
          if (response.data[key] !== undefined) {
            if (key === 'deviceConfiguration')
              newFields.deviceConfiguration = { value: '', uuid: response.data[key] };
            else if (key === 'rrm')
              newFields[key].value = response.data[key] === '' ? 'inherit' : response.data[key];
            else newFields[key].value = response.data[key];
          }
        }
        setTag(response.data);
        setFormFields({ ...newFields });

        if (response.data.deviceConfiguration !== '') {
          return axiosInstance.get(
            `${endpoints.owprov}/api/v1/configurations/${response.data.deviceConfiguration}`,
            options,
          );
        }
        return null;
      })
      .then((response) => {
        if (response)
          updateField('deviceConfiguration', { value: response.data.name, uuid: response.data.id });
      })
      .catch(() => {
        throw new Error('Error while fetching entity for edit');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editTag = () => {
    if (validation()) {
      setLoading(true);
      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      };

      const parameters = {};

      for (const [key, field] of Object.entries(fields)) {
        if (!field.ignore) {
          if (tag[key] !== field.value) {
            parameters[key] = field.value;
          }
        }
      }

      axiosInstance
        .put(`${endpoints.owprov}/api/v1/inventory/${tagSerialNumber}`, parameters, options)
        .then(() => {
          getTag();
          if (refreshTable !== null) refreshTable();
          addToast({
            title: t('common.success'),
            body: t('inventory.successful_tag_update'),
            color: 'success',
            autohide: true,
          });
        })
        .catch(() => {
          addToast({
            title: t('common.error'),
            body: t('inventory.tag_update_error'),
            color: 'danger',
            autohide: true,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const addNote = (newNote) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const parameters = {
      notes: [{ note: newNote }],
    };

    axiosInstance
      .put(`${endpoints.owprov}/api/v1/inventory/${tagSerialNumber}`, parameters, options)
      .then(() => {
        getTag();
      })
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('inventory.tag_update_error'),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      getTag();
      setFormFields(initialForm);
    }
  }, [show]);

  return (
    <CModal className="text-dark" size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">
          {t('common.edit')} {tag.name}
        </CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.save')}>
            <CButton color="primary" variant="outline" className="mx-2" onClick={editTag}>
              <CIcon content={cilSave} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody className="px-5">
        <EditInventoryTagForm
          t={t}
          disable={loading}
          fields={fields}
          updateField={updateFieldWithId}
          updateFieldDirectly={updateField}
          addNote={addNote}
          deviceTypes={deviceTypes}
        />
      </CModalBody>
    </CModal>
  );
};

EditTagModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  refreshTable: PropTypes.func,
  tagSerialNumber: PropTypes.string,
};

EditTagModal.defaultProps = {
  tagSerialNumber: null,
  refreshTable: null,
};

export default EditTagModal;

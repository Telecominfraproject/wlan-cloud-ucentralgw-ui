import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CPopover } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX, cilSave, cilPencil } from '@coreui/icons';
import { useToast, useFormFields, useAuth } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { checkIfJson } from 'utils/helper';
import Form from './Form';

const initialForm = {
  name: {
    value: '',
    error: false,
    required: true,
  },
  description: {
    value: '',
    error: false,
  },
  modelIds: {
    value: [],
    error: false,
    notEmpty: true,
  },
  configuration: {
    value: '',
    error: false,
    required: true,
  },
};

const EditConfigurationModal = ({ show, toggle, refresh, configId }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { currentToken, endpoints } = useAuth();
  const [fields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialForm);
  const [loading, setLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [editing, setEditing] = useState(false);

  const getConfig = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/default_configuration/${configId}`, options)
      .then((response) => {
        const newConfig = {};

        for (const key of Object.keys(response.data)) {
          if (key in initialForm) {
            newConfig[key] = {
              ...initialForm[key],
              value: response.data[key],
            };
          }
        }
        newConfig.configuration.value = JSON.stringify(response.data.configuration, null, 2);
        setFormFields(newConfig);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('configuration.error_fetching_config', {
            error: e.response?.data?.ErrorDescription,
          }),
          color: 'danger',
          autohide: true,
        });
        toggle();
      });
  };

  const getDeviceTypes = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.owfms}/api/v1/firmwares?deviceSet=true`, {
        headers,
      })
      .then((response) => {
        setDeviceTypes([...response.data.deviceTypes]);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const validation = () => {
    let success = true;

    for (const [key, field] of Object.entries(fields)) {
      if (field.required && field.value === '') {
        updateField(key, { error: true });
        success = false;
        break;
      }
      if (field.notEmpty && field.value.length === 0) {
        updateField(key, { error: true, notEmpty: true });
        success = false;
        break;
      }
    }

    if (!checkIfJson(fields.configuration.value)) {
      updateField('configuration', { error: true });
      success = false;
    }

    return success;
  };

  const save = () => {
    if (validation()) {
      setLoading(true);
      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      };

      const parameters = {
        name: fields.name.value,
        description: fields.description.value,
        modelIds: fields.modelIds.value,
        configuration: fields.configuration.value,
      };

      axiosInstance
        .put(`${endpoints.owgw}/api/v1/default_configuration/${configId}`, parameters, options)
        .then(() => {
          if (refresh !== null) refresh();
          toggle();
          addToast({
            title: t('common.success'),
            body: t('configuration.success_update'),
            color: 'success',
            autohide: true,
          });
        })
        .catch((e) => {
          addToast({
            title: t('common.error'),
            body: t('configuration.error_update', { error: e.response?.data?.ErrorDescription }),
            color: 'danger',
            autohide: true,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const toggleEditing = () => {
    if (editing) getConfig();
    setEditing(!editing);
  };

  useEffect(() => {
    if (show) {
      setEditing(false);
      getConfig();
      getDeviceTypes();
    }
  }, [show]);

  return (
    <CModal className="text-dark" size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('configuration.edit_configuration')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.save')}>
            <CButton
              color="primary"
              variant="outline"
              className="ml-2"
              onClick={save}
              disabled={!editing}
            >
              <CIcon content={cilSave} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.edit')}>
            <CButton
              color="primary"
              variant="outline"
              className="ml-2"
              onClick={toggleEditing}
              disabled={editing}
            >
              <CIcon content={cilPencil} />
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
        <Form
          t={t}
          disable={loading}
          fields={fields}
          editing={editing}
          updateField={updateFieldWithId}
          updateFieldWithKey={updateField}
          deviceTypes={deviceTypes}
          show={show}
        />
      </CModalBody>
    </CModal>
  );
};

EditConfigurationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  refresh: PropTypes.func,
  configId: PropTypes.string,
};

EditConfigurationModal.defaultProps = {
  refresh: null,
  configId: '',
};

export default EditConfigurationModal;

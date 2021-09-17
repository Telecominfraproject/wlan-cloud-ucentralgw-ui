import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CModal, CModalHeader, CModalBody } from '@coreui/react';
import { CreateUserForm, useFormFields, useAuth, useToast } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { testRegex, validateEmail } from 'utils/helper';

const initialState = {
  name: {
    value: '',
    error: false,
    optional: true,
  },
  email: {
    value: '',
    error: false,
  },
  currentPassword: {
    value: '',
    error: false,
  },
  changePassword: {
    value: 'on',
    error: false,
  },
  userRole: {
    value: 'admin',
    error: false,
  },
  notes: {
    value: '',
    error: false,
    optional: true,
  },
  description: {
    value: '',
    error: false,
    optional: true,
  },
};

const CreateUserModal = ({ show, toggle, getUsers }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState({
    passwordPolicy: '',
    passwordPattern: '',
    accessPolicy: '',
  });
  const [formFields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialState);

  const toggleChange = () => {
    updateField('changePassword', { value: !formFields.changePassword.value });
  };

  const createUser = () => {
    setLoading(true);

    const parameters = {
      id: 0,
    };

    let validationSuccess = true;

    for (const [key, value] of Object.entries(formFields)) {
      if (!value.optional && value.value === '') {
        validationSuccess = false;
        updateField(key, { value: value.value, error: true });
      } else if (key === 'currentPassword' && !testRegex(value.value, policies.passwordPattern)) {
        validationSuccess = false;
        updateField(key, { value: value.value, error: true });
      } else if (key === 'email' && !validateEmail(value.value)) {
        validationSuccess = false;
        updateField(key, { value: value.value, error: true });
      } else if (key === 'notes') {
        parameters[key] = [{ note: value.value }];
      } else if (key === 'changePassword') {
        parameters[key] = value.value === 'on';
      } else {
        parameters[key] = value.value;
      }
    }

    if (validationSuccess) {
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      };

      axiosInstance
        .post(`${endpoints.owsec}/api/v1/user/0`, parameters, {
          headers,
        })
        .then(() => {
          getUsers();
          setFormFields(initialState);
          addToast({
            title: t('common.success'),
            body: t('user.create_success'),
            color: 'success',
            autohide: true,
          });
          toggle();
        })
        .catch(() => {
          addToast({
            title: t('common.error'),
            body: t('user.create_failure'),
            color: 'danger',
            autohide: true,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const getPasswordPolicy = () => {
    axiosInstance
      .post(`${endpoints.owsec}/api/v1/oauth2?requirements=true`, {})
      .then((response) => {
        const newPolicies = response.data;
        newPolicies.accessPolicy = `${endpoints.owsec}${newPolicies.accessPolicy}`;
        newPolicies.passwordPolicy = `${endpoints.owsec}${newPolicies.passwordPolicy}`;
        setPolicies(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (policies.passwordPattern.length === 0) getPasswordPolicy();
  }, []);

  useEffect(() => {
    setFormFields(initialState);
  }, [show]);

  return (
    <CModal show={show} onClose={toggle} size="xl">
      <CModalHeader>{t('user.create')}</CModalHeader>
      <CModalBody>
        <CreateUserForm
          t={t}
          fields={formFields}
          updateField={updateFieldWithId}
          createUser={createUser}
          loading={loading}
          policies={policies}
          toggleChange={toggleChange}
        />
      </CModalBody>
    </CModal>
  );
};

CreateUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
};

export default React.memo(CreateUserModal);

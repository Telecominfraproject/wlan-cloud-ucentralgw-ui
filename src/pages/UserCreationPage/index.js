import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CCard, CCardBody, CCardHeader, CToast, CToaster, CToastBody } from '@coreui/react';
import { CreateUserForm, useFormFields } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'contexts/AuthProvider';
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
    value: true,
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

const UserCreationPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState({
    passwordPolicy: '',
    passwordPattern: '',
    accessPolicy: '',
  });
  const [formFields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialState);
  const [toast, setToast] = useState({
    show: false,
    success: true,
  });

  const createUser = () => {
    setToast(false);
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
        .post(`${endpoints.ucentralsec}/api/v1/user/0`, parameters, {
          headers,
        })
        .then(() => {
          setFormFields(initialState);
          setToast({
            success: true,
            show: true,
          });
        })
        .catch(() => {
          setToast({
            success: false,
            show: true,
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
      .post(`${endpoints.ucentralsec}/api/v1/oauth2?requirements=true`, {})
      .then((response) => {
        setPolicies(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (policies.passwordPattern.length === 0) getPasswordPolicy();
  }, []);
  return (
    <div>
      <CCard>
        <CCardHeader>{t('user.create')}</CCardHeader>
        <CCardBody>
          <CreateUserForm
            t={t}
            fields={formFields}
            updateField={updateFieldWithId}
            createUser={createUser}
            loading={loading}
            policies={policies}
          />
        </CCardBody>
      </CCard>
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color={toast.success ? 'success' : 'danger'}
          className="text-white align-items-center"
          show={toast.show}
        >
          <div className="d-flex">
            <CToastBody>
              {toast.success ? t('user.create_success') : t('user.create_failure')}
            </CToastBody>
          </div>
        </CToast>
      </CToaster>
    </div>
  );
};

export default UserCreationPage;

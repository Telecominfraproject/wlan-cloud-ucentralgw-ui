import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { useUser, EditUserModal as Modal, useAuth } from 'ucentral-libs';
import { CCol, CRow, CToaster, CToast, CToastBody, CToastHeader } from '@coreui/react';

const initialState = {
  Id: {
    value: '',
    error: false,
    editable: false,
  },
  changePassword: {
    value: false,
    error: false,
    editable: false,
  },
  currentPassword: {
    value: '',
    error: false,
    editable: true,
  },
  email: {
    value: '',
    error: false,
    editable: false,
  },
  description: {
    value: '',
    error: false,
    editable: true,
  },
  name: {
    value: '',
    error: false,
    editable: true,
  },
  userRole: {
    value: '',
    error: false,
    editable: true,
  },
  notes: {
    value: [],
    editable: false,
  },
};

const EditUserModal = ({ show, toggle, userId, getUsers }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialUser, setInitialUser] = useState({});
  const [user, updateWithId, updateWithKey, setUser] = useUser(initialState);
  const [toast, setToast] = useState({
    show: false,
    success: true,
  });
  const [policies, setPolicies] = useState({
    passwordPolicy: '',
    passwordPattern: '',
    accessPolicy: '',
  });

  const getPasswordPolicy = () => {
    axiosInstance
      .post(`${endpoints.ucentralsec}/api/v1/oauth2?requirements=true`, {})
      .then((response) => {
        const newPolicies = response.data;
        newPolicies.accessPolicy = `${endpoints.ucentralsec}${newPolicies.accessPolicy}`;
        newPolicies.passwordPolicy = `${endpoints.ucentralsec}${newPolicies.passwordPolicy}`;
        setPolicies(response.data);
      })
      .catch(() => {});
  };

  const getUser = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.ucentralsec}/api/v1/user/${userId}`, options)
      .then((response) => {
        const newUser = {};

        for (const key of Object.keys(response.data)) {
          if (key in initialState && key !== 'currentPassword') {
            newUser[key] = {
              ...initialState[key],
              value: response.data[key],
            };
          }
        }
        setInitialUser({ ...initialState, ...newUser });
        setUser({ ...initialState, ...newUser });
      })
      .catch(() => {});
  };

  const updateUser = () => {
    setLoading(true);

    const parameters = {
      id: userId,
    };

    let newData = false;

    for (const key of Object.keys(user)) {
      if (user[key].editable && user[key].value !== initialUser[key].value) {
        if (key === 'currentPassword' && user[key].length < 8) {
          updateWithKey('currentPassword', {
            error: true,
          });
          newData = false;
          break;
        } else if (key === 'changePassword') {
          parameters[key] = user[key].value === 'on';
          newData = true;
        } else {
          parameters[key] = user[key].value;
          newData = true;
        }
      }
    }

    if (newData) {
      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      };

      axiosInstance
        .put(`${endpoints.ucentralsec}/api/v1/user/${userId}`, parameters, options)
        .then(() => {
          setToast({
            success: true,
            show: true,
          });
          getUsers();
          toggle();
        })
        .catch(() => {
          setToast({
            success: false,
            show: true,
          });
          getUser();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setToast({
        success: true,
        show: true,
      });
      getUsers();
      toggle();
    }
  };

  const addNote = (currentNote) => {
    setLoading(true);

    const parameters = {
      id: userId,
      notes: [{ note: currentNote }],
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.ucentralsec}/api/v1/user/${userId}`, parameters, options)
      .then(() => {
        getUser();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (userId) {
      getUser();
    }
    if (policies.passwordPattern.length === 0) {
      getPasswordPolicy();
    }
  }, [userId]);

  return (
    <div>
      <CRow>
        <CCol>
          <Modal
            t={t}
            user={user}
            updateUserWithId={updateWithId}
            saveUser={updateUser}
            loading={loading}
            policies={policies}
            show={show}
            toggle={toggle}
            addNote={addNote}
          />
        </CCol>
      </CRow>
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color={toast.success ? 'success' : 'danger'}
          className="text-white align-items-center"
          show={toast.show}
        >
          <CToastHeader closeButton>
            {toast.success ? t('user.update_success_title') : t('user.update_failure_title')}
          </CToastHeader>
          <div className="d-flex">
            <CToastBody>
              {toast.success ? t('user.update_success') : t('user.update_failure')}
            </CToastBody>
          </div>
        </CToast>
      </CToaster>
    </div>
  );
};

EditUserModal.propTypes = {
  userId: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
};

export default React.memo(EditUserModal);

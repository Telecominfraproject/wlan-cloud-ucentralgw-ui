import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'contexts/AuthProvider';
import { useUser, UserProfileCard } from 'ucentral-libs';
import { CCol, CRow, CToaster, CToast, CToastBody } from '@coreui/react';

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
};

const UserPage = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialUser, setInitialUser] = useState({});
  const [user, updateWithId, updateWithKey, setUser] = useUser(initialState);
  const [toast, setToast] = useState({
    show: false,
    success: true,
  });

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
      if (user[key].value !== initialUser[key].value) {
        if (key === 'currentPassword' && user[key].length < 8) {
          updateWithKey('currentPassword', {
            error: true,
          });
          newData = false;
          break;
        }
        parameters[key] = user[key].value;
        newData = true;
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
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      <CRow>
        <CCol>
          <UserProfileCard
            t={t}
            user={user}
            updateUserWithId={updateWithId}
            saveUser={updateUser}
            loading={loading}
          />
        </CCol>
        <CCol />
      </CRow>
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
              {toast.success ? t('user.update_success') : t('user.update_failure')}
            </CToastBody>
          </div>
        </CToast>
      </CToaster>
    </div>
  );
};

export default UserPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CCard, CCardBody, CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import axiosInstance from 'utils/axiosInstance';
import { testRegex } from 'utils/helper';
import { useAuth } from 'contexts/AuthProvider';
import { useUser, EditMyProfile } from 'ucentral-libs';

const initialState = {
  Id: {
    value: '',
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

const ProfilePage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints, user, getAvatar, avatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialUser, setInitialUser] = useState({});
  const [userForm, updateWithId, updateWithKey, setUser] = useUser(initialState);
  const [newAvatar, setNewAvatar] = useState('');
  const [newAvatarFile, setNewAvatarFile] = useState(null);
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
      .get(`${endpoints.ucentralsec}/api/v1/user/${user.Id}`, options)
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
      id: user.Id,
    };

    let newData = true;

    for (const key of Object.keys(userForm)) {
      if (userForm[key].editable && userForm[key].value !== initialUser[key].value) {
        if (
          key === 'currentPassword' &&
          !testRegex(userForm[key].value, policies.passwordPattern)
        ) {
          updateWithKey('currentPassword', {
            error: true,
          });
          newData = false;
          break;
        } else {
          parameters[key] = userForm[key].value;
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
        .put(`${endpoints.ucentralsec}/api/v1/user/${user.Id}`, parameters, options)
        .then(() => {
          setToast({
            success: true,
            show: true,
          });
          getUser();
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
    }
  };

  const addNote = (currentNote) => {
    setLoading(true);

    const parameters = {
      id: user.Id,
      notes: [{ note: currentNote }],
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.ucentralsec}/api/v1/user/${user.Id}`, parameters, options)
      .then(() => {
        getUser();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const uploadAvatar = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const data = new FormData();
    data.append('file', newAvatarFile);

    axiosInstance
      .post(`${endpoints.ucentralsec}/api/v1/avatar/${user.Id}`, data, options)
      .then(() => {
        setToast({
          success: true,
          show: true,
        });
        getAvatar();
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
  };

  const showPreview = (e) => {
    const imageFile = e.target.files[0];
    setNewAvatar(URL.createObjectURL(imageFile));
    setNewAvatarFile(imageFile);
  };

  const deleteAvatar = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };
    return axiosInstance
      .delete(`${endpoints.ucentralsec}/api/v1/avatar/${user.Id}`, options)
      .then(() => {
        getAvatar();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user.Id) {
      getAvatar();
      getUser();
    }
    if (policies.passwordPattern.length === 0) {
      getPasswordPolicy();
    }
  }, [user.Id]);

  return (
    <div>
      <CCard>
        <CCardBody>
          <EditMyProfile
            t={t}
            user={userForm}
            updateUserWithId={updateWithId}
            saveUser={updateUser}
            loading={loading}
            policies={policies}
            addNote={addNote}
            uploadAvatar={uploadAvatar}
            avatar={avatar}
            newAvatar={newAvatar}
            showPreview={showPreview}
            deleteAvatar={deleteAvatar}
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

export default ProfilePage;

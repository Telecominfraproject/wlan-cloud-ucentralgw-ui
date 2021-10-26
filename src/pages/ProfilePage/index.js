import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CCard, CCardBody, CCardHeader, CButton, CPopover, CButtonToolbar } from '@coreui/react';
import { cilPencil, cilSave, cilSync, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import axiosInstance from 'utils/axiosInstance';
import { testRegex } from 'utils/helper';
import { useUser, EditMyProfile, useAuth, useToast } from 'ucentral-libs';

const initialState = {
  Id: {
    value: '',
    error: false,
    editable: false,
  },
  newPassword: {
    value: '',
    error: false,
    editable: true,
    ignore: true,
  },
  confirmNewPassword: {
    value: '',
    error: false,
    editable: true,
    ignore: true,
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
  notes: {
    value: [],
    editable: false,
  },
  userTypeProprietaryInfo: {
    value: {},
    error: false,
  },
  mfaMethod: {
    value: '',
    error: false,
  },
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints, user, getAvatar, avatar } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userForm, updateWithId, updateWithKey, setUser] = useUser(initialState);
  const [newAvatar, setNewAvatar] = useState('');
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [policies, setPolicies] = useState({
    passwordPolicy: '',
    passwordPattern: '',
    accessPolicy: '',
  });

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

  const getUser = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owsec}/api/v1/user/${user.Id}`, options)
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

        newUser.mfaMethod = {
          value: response.data.userTypeProprietaryInfo.mfa.enabled
            ? response.data.userTypeProprietaryInfo.mfa.method
            : '',
          error: false,
        };

        setUser({ ...initialState, ...newUser });
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('user.error_fetching_users', { error: e }),
          color: 'danger',
          autohide: true,
        });
      });
  };

  const uploadAvatar = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const data = new FormData();
    data.append('file', newAvatarFile);

    axiosInstance
      .post(`${endpoints.owsec}/api/v1/avatar/${user.Id}`, data, options)
      .then(() => {
        addToast({
          title: t('user.update_success_title'),
          body: t('user.update_success'),
          color: 'success',
          autohide: true,
        });
        getAvatar();
        setNewAvatar('');
        setNewAvatarFile(null);
        setFileInputKey(fileInputKey + 1);
      })
      .catch(() => {
        addToast({
          title: t('user.update_failure_title'),
          body: t('user.update_failure'),
          color: 'danger',
          autohide: true,
        });
      });
  };

  const updateUser = () => {
    setLoading(true);

    if (newAvatarFile !== null) {
      uploadAvatar();
    }

    if (
      userForm.newPassword.value !== '' &&
      (!testRegex(userForm.newPassword.value, policies.passwordPattern) ||
        userForm.newPassword.value !== userForm.confirmNewPassword.value)
    ) {
      updateWithKey('newPassword', {
        error: true,
      });
      setLoading(false);
    } else {
      const newNotes = [];

      for (let i = 0; i < userForm.notes.value.length; i += 1) {
        if (userForm.notes.value[i].new) newNotes.push({ note: userForm.notes.value[i].note });
      }

      const propInfo = { ...userForm.userTypeProprietaryInfo.value };
      propInfo.mfa.method = userForm.mfaMethod.value === '' ? undefined : userForm.mfaMethod.value;
      propInfo.mfa.enabled = userForm.mfaMethod.value !== '';

      const parameters = {
        id: user.Id,
        description: userForm.description.value,
        name: userForm.name.value,
        notes: newNotes,
        userTypeProprietaryInfo: propInfo,
        currentPassword: userForm.newPassword.value !== '' ? userForm.newPassword.value : undefined,
      };

      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      };

      axiosInstance
        .put(`${endpoints.owsec}/api/v1/user/${user.Id}`, parameters, options)
        .then(() => {
          addToast({
            title: t('user.update_success_title'),
            body: t('user.update_success'),
            color: 'success',
            autohide: true,
          });
          // eslint-disable-next-line no-use-before-define
          toggleEditing();
        })
        .catch((e) => {
          addToast({
            title: t('user.update_failure_title'),
            body: t('user.update_failure', { error: e.response?.data?.ErrorDescription }),
            color: 'danger',
            autohide: true,
          });
        })
        .finally(() => {
          getUser();
          setLoading(false);
        });
    }
  };

  const addNote = (currentNote) => {
    const newNotes = [...userForm.notes.value];
    newNotes.unshift({
      note: currentNote,
      new: true,
      created: new Date().getTime() / 1000,
      createdBy: '',
    });
    updateWithKey('notes', { value: newNotes });
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
      .delete(`${endpoints.owsec}/api/v1/avatar/${user.Id}`, options)
      .then(() => {
        getAvatar();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const sendPhoneNumberTest = async (phoneNumber) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    return axiosInstance
      .post(`${endpoints.owsec}/api/v1/sms?validateNumber=true`, { to: phoneNumber }, options)
      .then(() => true)
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('user.error_sending_code'),
          color: 'danger',
          autohide: true,
        });
        return false;
      });
  };

  const testVerificationCode = async (phoneNumber, code) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    return axiosInstance
      .post(
        `${endpoints.owsec}/api/v1/sms?completeValidation=true&validationCode=${code}`,
        { to: phoneNumber },
        options,
      )
      .then(() => true)
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('user.wrong_validation_code'),
          color: 'danger',
          autohide: true,
        });
        return false;
      });
  };

  const toggleEditing = () => {
    if (editing) getUser();
    setEditing(!editing);
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
    <CCard>
      <CCardHeader className="p-1">
        <div className="text-value-lg float-left">{t('user.my_profile')}</div>
        <div className="text-right float-right">
          <CButtonToolbar role="group" className="justify-content-end">
            <CPopover content={t('common.save')}>
              <CButton
                disabled={!editing}
                color="primary"
                variant="outline"
                onClick={updateUser}
                className="mx-1"
              >
                <CIcon name="cil-save" content={cilSave} />
              </CButton>
            </CPopover>
            <CPopover content={t('common.edit')}>
              <CButton
                disabled={editing}
                color="primary"
                variant="outline"
                onClick={toggleEditing}
                className="mx-1"
              >
                <CIcon name="cil-pencil" content={cilPencil} />
              </CButton>
            </CPopover>
            <CPopover content={t('common.stop_editing')}>
              <CButton
                disabled={!editing}
                color="primary"
                variant="outline"
                onClick={toggleEditing}
                className="mx-1"
              >
                <CIcon name="cil-x" content={cilX} />
              </CButton>
            </CPopover>
            <CPopover content={t('common.refresh')}>
              <CButton
                disabled={editing}
                color="primary"
                variant="outline"
                onClick={getUser}
                className="mx-1"
              >
                <CIcon content={cilSync} />
              </CButton>
            </CPopover>
          </CButtonToolbar>
        </div>
      </CCardHeader>
      <CCardBody>
        <EditMyProfile
          t={t}
          user={userForm}
          updateUserWithId={updateWithId}
          updateWithKey={updateWithKey}
          loading={loading}
          policies={policies}
          addNote={addNote}
          avatar={avatar}
          newAvatar={newAvatar}
          showPreview={showPreview}
          deleteAvatar={deleteAvatar}
          fileInputKey={fileInputKey}
          sendPhoneNumberTest={sendPhoneNumberTest}
          testVerificationCode={testVerificationCode}
          editing={editing}
        />
      </CCardBody>
    </CCard>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CBadge,
} from '@coreui/react';
import PropTypes from 'prop-types';

const ConfirmModal = ({ show, toggle, action }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [haveResult, setHaveResult] = useState(false);
  const [success, setSuccess] = useState(false);

  const getButtonContent = () => {
    if (haveResult) {
      if (success) {
        return (
          <CBadge color="success" shape="pill">
            {t('common.success')}
          </CBadge>
        );
      }
      return (
        <CBadge color="danger" shape="pill">
          {t('common.failure')}
        </CBadge>
      );
    }
    if (loading) {
      return (
        <div>
          {t('common.loading_ellipsis')}
          <CSpinner color="light" component="span" size="sm" />
        </div>
      );
    }
    return t('common.yes');
  };

  const doAction = async () => {
    setLoading(true);
    const result = await action();
    setSuccess(result);
    setHaveResult(true);
    setLoading(false);
    if (result) {
      toggle();
    }
  };

  useEffect(() => {
    setLoading(false);
    setHaveResult(false);
    setSuccess(false);
  }, [show]);

  return (
    <CModal className="text-dark" show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle>{t('delete_command.title')}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>{t('delete_command.explanation')}</h6>
      </CModalBody>
      <CModalFooter>
        <CButton disabled={loading} color="primary" onClick={() => doAction()}>
          {getButtonContent()}
        </CButton>
        <CButton color="secondary" onClick={toggle}>
          {t('common.cancel')}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
};

export default ConfirmModal;

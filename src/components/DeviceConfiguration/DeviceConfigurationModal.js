/* eslint-disable-rule prefer-destructuring */
import React from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react';
import PropTypes from 'prop-types';
import { Translation } from 'react-i18next';

const DeviceConfigurationModal = ({ show, toggle, configuration }) => (
  <Translation>
    {(t) => (
      <CModal size="lg" show={show} onClose={toggle}>
        <CModalHeader closeButton>
          <CModalTitle className="text-dark">{t('configuration.title')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <pre className="ignore">{JSON.stringify(configuration, null, 2)}</pre>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={toggle}>
            {t('common.close')}
          </CButton>
        </CModalFooter>
      </CModal>
    )}
  </Translation>
);

DeviceConfigurationModal.propTypes = {
  configuration: PropTypes.instanceOf(Object).isRequired,
  toggle: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default DeviceConfigurationModal;

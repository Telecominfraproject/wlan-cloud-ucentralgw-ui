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

const DeviceConfigurationModal = ({ show, toggle, configuration }) => (
    <CModal size="lg" show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle style={{ color: 'black' }}>
          Device Configuration
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <pre className="ignore">{JSON.stringify(configuration, null, 4)}</pre>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={toggle}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
);

DeviceConfigurationModal.propTypes = {
  configuration: PropTypes.instanceOf(Object).isRequired,
  toggle: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default DeviceConfigurationModal;

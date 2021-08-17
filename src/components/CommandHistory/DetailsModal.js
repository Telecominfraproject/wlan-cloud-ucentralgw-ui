import React from 'react';
import PropTypes from 'prop-types';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react';

const DetailsModal = ({ t, show, toggle, details, commandUuid }) => (
  <CModal size="lg" show={show} onClose={toggle}>
    <CModalHeader closeButton>
      <CModalTitle className="text-dark">{commandUuid}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <pre className="ignore">{JSON.stringify(details, null, 4)}</pre>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={toggle}>
        {t('common.close')}
      </CButton>
    </CModalFooter>
  </CModal>
);

DetailsModal.propTypes = {
  t: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  details: PropTypes.instanceOf(Object).isRequired,
  commandUuid: PropTypes.string.isRequired,
};

export default DetailsModal;

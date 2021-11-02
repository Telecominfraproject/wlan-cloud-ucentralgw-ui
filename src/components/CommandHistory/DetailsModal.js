import React from 'react';
import PropTypes from 'prop-types';
import { CButton, CModal, CModalHeader, CModalBody, CModalTitle, CPopover } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';

const DetailsModal = ({ t, show, toggle, details, commandUuid }) => (
  <CModal size="lg" show={show} onClose={toggle}>
    <CModalHeader className="p-1">
      <CModalTitle className="text-dark">{commandUuid}</CModalTitle>
      <div className="text-right">
        <CPopover content={t('common.close')}>
          <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
            <CIcon content={cilX} />
          </CButton>
        </CPopover>
      </div>
    </CModalHeader>
    <CModalBody>
      <pre className="ignore">{JSON.stringify(details, null, 2)}</pre>
    </CModalBody>
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

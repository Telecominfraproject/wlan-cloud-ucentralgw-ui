import React from 'react';
import PropTypes from 'prop-types';
import { CButton, CModalBody, CModalFooter } from '@coreui/react';

const SuccessfulActionModalBody = ({ toggleModal }) => (
  <div>
    <CModalBody>
      <h6>Command submitted succesfuly</h6>
    </CModalBody>
    <CModalFooter>
      <CButton onClick={() => toggleModal()} block>
        Dismiss
      </CButton>
    </CModalFooter>
  </div>
);

SuccessfulActionModalBody.propTypes = {
  toggleModal: PropTypes.func.isRequired,
};

export default SuccessfulActionModalBody;

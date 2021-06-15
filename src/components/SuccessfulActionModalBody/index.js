import React from 'react';
import { Translation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CButton, CModalBody, CModalFooter } from '@coreui/react';

const SuccessfulActionModalBody = ({ toggleModal }) => (
  <Translation>
    {(t) => (
      <div>
        <CModalBody>
          <h6>{t('commands.success')}</h6>
        </CModalBody>
        <CModalFooter>
          <CButton variant="outline" color="primary" onClick={() => toggleModal()} block>
            {t('common.dismiss')}
          </CButton>
        </CModalFooter>
      </div>
    )}
  </Translation>
);

SuccessfulActionModalBody.propTypes = {
  toggleModal: PropTypes.func.isRequired,
};

export default SuccessfulActionModalBody;

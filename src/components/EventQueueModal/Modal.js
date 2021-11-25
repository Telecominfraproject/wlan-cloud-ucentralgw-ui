import React from 'react';
import PropTypes from 'prop-types';
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CPopover,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';

const EventQueueModal = ({ t, show, toggle, loading, result }) => (
  <CModal size="lg" show={show} onClose={toggle}>
    <CModalHeader className="p-1">
      <CModalTitle className="pl-1 pt-1">{t('commands.event_queue')}</CModalTitle>
      <div className="text-right">
        <CPopover content={t('common.close')}>
          <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
            <CIcon content={cilX} />
          </CButton>
        </CPopover>
      </div>
    </CModalHeader>
    <CModalBody className="text-center">
      {loading ? (
        <CSpinner color="primary" size="lg" />
      ) : (
        <pre className="ignore text-left">{JSON.stringify(result, null, 4)}</pre>
      )}
    </CModalBody>
  </CModal>
);

EventQueueModal.propTypes = {
  t: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  result: PropTypes.instanceOf(Object).isRequired,
};

export default EventQueueModal;

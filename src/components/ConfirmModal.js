import React, { useState, useEffect} from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
	CBadge
} from '@coreui/react';
import PropTypes from 'prop-types';

const ConfirmModal = ({ show, toggle, action }) => {
	const [loading, setLoading] = useState(false);
	const [haveResult, setHaveResult] = useState(false);
	const [success, setSuccess] = useState(false);

	const getButtonContent = () => {
		if(haveResult){
			if(success){
				return (
          <CBadge color="success" shape="pill">Success</CBadge>
				);
			}
			return (
				<CBadge color="danger" shape="pill">Error</CBadge>
			);
		}
		if(loading){
			return (
				<div>
					Loading...
					<CSpinner component="span" size="sm" />
				</div>
			);
		}
		return 'Yes';
	}

	const doAction = async () => {
		setLoading(true);
		const result = await action();
		setSuccess(result);
		setHaveResult(true);
		setLoading(false);
	}

  useEffect(() => {
    setLoading(false);
    setHaveResult(false);
    setSuccess(false);
  }, [show]);

	return(
		<CModal style= {{color: '#3c4b64'}} show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle>Delete Command</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>Are you sure you want to delete this command? this action is not reversible.</h6>
      </CModalBody>
      <CModalFooter>
        <CButton
          disabled={loading}
          color="primary"
          onClick={() => doAction()}
        >
					{getButtonContent()}
        </CButton>
        <CButton color="secondary" onClick={toggle}>
          Cancel
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

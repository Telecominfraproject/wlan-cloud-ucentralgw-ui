import React from 'react';
import { CCollapse, CCardBody } from '@coreui/react';
import PropTypes from 'prop-types';

const DeviceCommandsCollapse = ({ details, responses, index, item, getDetails, getResponse }) => (
  <div>
    <CCollapse show={details.includes(index)}>
      <CCardBody>
        <h5>Result</h5>
        <div>{getDetails(item.command, item, index)}</div>
      </CCardBody>
    </CCollapse>
    <CCollapse show={responses.includes(index)}>
      <CCardBody>
        <h5>Details</h5>
        <div>{getResponse(item, index)}</div>
      </CCardBody>
    </CCollapse>
  </div>
);

DeviceCommandsCollapse.propTypes = {
  details: PropTypes.instanceOf(Array).isRequired,
  responses: PropTypes.instanceOf(Array).isRequired,
  index: PropTypes.number.isRequired,
  getDetails: PropTypes.func.isRequired,
  getResponse: PropTypes.func.isRequired,
  item: PropTypes.instanceOf(Object).isRequired,
};

export default DeviceCommandsCollapse;

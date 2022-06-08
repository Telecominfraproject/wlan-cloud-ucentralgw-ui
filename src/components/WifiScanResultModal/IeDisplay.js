import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CButton, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft } from '@coreui/icons';

const IeDisplay = ({ ies, setIes }) => {
  const handleClick = () => {
    setIes(undefined);
  };

  const display = useMemo(
    () =>
      ies.map((ie) => {
        if (ie.byteArr) {
          return (
            <CCol sm="6">
              <h5
                style={{
                  textDecoration: 'underline',
                }}
              >
                {ie.name}:{' '}
              </h5>
              <pre>
                {ie.byteArr.map((arr, i) => {
                  const offset = (i * 8).toString(16);
                  return (
                    <pre
                      className="mb-0"
                      style={{
                        overflowY: 'auto',
                        maxHeight: '200px',
                      }}
                    >
                      {offset.length === 1 ? `0${offset}` : offset}: {arr.join('  ')}
                    </pre>
                  );
                })}
              </pre>
            </CCol>
          );
        }
        return (
          <CCol sm="6">
            <h5
              style={{
                textDecoration: 'underline',
              }}
            >
              {ie.name}:{' '}
            </h5>
            <pre
              style={{
                overflowY: 'auto',
                maxHeight: '200px',
              }}
            >
              {JSON.stringify(ie.data, null, 4)}
            </pre>
          </CCol>
        );
      }),
    [ies],
  );

  return (
    <>
      <CRow>
        <CCol>
          <h4>Information Elements</h4>
        </CCol>
        <CCol className="text-right">
          <CButton color="primary" variant="outline" className="ml-2" onClick={handleClick}>
            Go Back
            <CIcon className="ml-2" content={cilArrowLeft} />
          </CButton>
        </CCol>
      </CRow>
      <CRow>{display}</CRow>
    </>
  );
};

IeDisplay.propTypes = {
  ies: PropTypes.instanceOf(Array).isRequired,
  setIes: PropTypes.func.isRequired,
};

export default IeDisplay;

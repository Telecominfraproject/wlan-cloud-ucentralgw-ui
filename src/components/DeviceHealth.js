/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import { CWidgetProgress, CCollapse, CButton, CDataTable, CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { cleanTimestamp } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';

const DeviceHealth = () => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);
  let sanityLevel;
  let barColor;

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const getDeviceHealth = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${selectedDeviceId}/healthchecks`, options)
      .then((response) => {
        setHealthChecks(response.data.values);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response);
      });
  };

  // Function called from the button on the table so that a user can see more details
  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();

    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  };

  const columns = [
    { key: 'UUID', label: 'Config. Id' },
    { key: 'recorded' },
    { key: 'sanity' },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    getDeviceHealth();
  }, []);

  if (healthChecks && healthChecks.length > 0) {
    sanityLevel = healthChecks[0].sanity;
    if (sanityLevel === 100) barColor = 'gradient-success';
    else if (sanityLevel >= 90) barColor = 'gradient-warning';
    else barColor = 'gradient-danger';
  }

  return (
    <CWidgetProgress
      header={sanityLevel ? `${sanityLevel}%` : 'Unknown'}
      text="Device Health"
      value={sanityLevel ?? 100}
      color={barColor}
      inverse
      footer={
        <div>
          <CCollapse show={collapse}>
            <CCard>
              <div className="overflow-auto" style={{ height: '250px' }}>
                <CDataTable
                  items={healthChecks ?? []}
                  fields={columns}
                  style={{ color: 'white' }}
                  sorterValue={{ column: 'recorded', desc: 'true' }}
                  scopedSlots={{
                    recorded: (item) => <td>{cleanTimestamp(item.recorded)}</td>,
                    sanity: (item) => <td>{`${item.sanity}%`}</td>,
                    show_details: (item, index) => {
                      if (item.sanity === 100) {
                        return <></>;
                      }
                      return (
                        <td className="py-2">
                          <CButton
                            color="primary"
                            variant="outline"
                            shape="square"
                            size="sm"
                            onClick={() => {
                              toggleDetails(index);
                            }}
                          >
                            {details.includes(index) ? 'Hide' : 'Show'}
                          </CButton>
                        </td>
                      );
                    },
                    details: (item, index) => (
                      <CCollapse show={details.includes(index)}>
                        <CCardBody>
                          <h5>Details</h5>
                          <div>
                            <pre>{JSON.stringify(item.values, null, 4)}</pre>
                          </div>
                        </CCardBody>
                      </CCollapse>
                    ),
                  }}
                />
              </div>
            </CCard>
          </CCollapse>
          <CButton show={collapse} color="transparent" onClick={toggle} block>
            <CIcon
              name={collapse ? 'cilChevronTop' : 'cilChevronBottom'}
              style={{ color: 'white' }}
              size="lg"
            />
          </CButton>
        </div>
      }
    />
  );
};

export default DeviceHealth;

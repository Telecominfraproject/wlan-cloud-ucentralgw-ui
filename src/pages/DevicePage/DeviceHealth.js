/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CWidgetDropdown,
  CCollapse,
  CButton,
  CDataTable,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { prettyDate, addDays, dateToUnix } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/authHelper';

const DeviceHealth = ({ selectedDeviceId }) => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthChecks, setHealthChecks] = useState([]);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());
  let sanityLevel;
  let barColor;

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const modifyStart = (value) => {
    setStart(value);
  };

  const modifyEnd = (value) => {
    setEnd(value);
  };

  const getDeviceHealth = () => {
    if (loading) return;
    setLoading(true);
    const utcStart = new Date(start).toISOString();
    const utcEnd = new Date(end).toISOString();

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        startDate: dateToUnix(utcStart),
        endDate: dateToUnix(utcEnd),
      },
    };

    axiosInstance
      .get(`/device/${encodeURIComponent(selectedDeviceId)}/healthchecks`, options)
      .then((response) => {
        setHealthChecks(response.data.values);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
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

  const getDetails = (index, healthCheckDetails) => {
    if (details.includes(index))
      return <pre className="ignore">{JSON.stringify(healthCheckDetails, null, 4)}</pre>;
    return <pre className="ignore" />;
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
    if (selectedDeviceId) {
      getDeviceHealth();
    }
  }, [selectedDeviceId, start, end]);

  if (healthChecks && healthChecks.length > 0) {
    sanityLevel = healthChecks[healthChecks.length - 1].sanity;
    if (sanityLevel === 100) barColor = 'gradient-success';
    else if (sanityLevel >= 90) barColor = 'gradient-warning';
    else barColor = 'gradient-danger';
  } else {
    sanityLevel = 0;
    barColor = 'gradient-dark';
  }

  return (
    <CWidgetDropdown
      header={sanityLevel ? `${sanityLevel}%` : 'Unknown'}
      text="Device Health"
      value={sanityLevel ?? 100}
      color={barColor}
      inverse="true"
      footerSlot={
        <div style={{ padding: '20px' }}>
          <CProgress style={{ marginBottom: '20px' }} color="white" value={sanityLevel ?? 0} />
          <CCollapse show={collapse}>
            <CRow style={{ marginBottom: '10px' }}>
              <CCol>
                From:
                <DatePicker
                  selected={start === '' ? new Date() : new Date(start)}
                  value={start === '' ? new Date() : new Date(start)}
                  includeTime
                  onChange={(date) => modifyStart(date)}
                />
              </CCol>
              <CCol>
                To:
                <DatePicker
                  selected={end === '' ? new Date() : new Date(end)}
                  value={end === '' ? new Date() : new Date(end)}
                  includeTime
                  onChange={(date) => modifyEnd(date)}
                />
              </CCol>
            </CRow>
            <CCard>
              <div className="overflow-auto" style={{ height: '250px' }}>
                <CDataTable
                  items={healthChecks ?? []}
                  fields={columns}
                  style={{ color: 'white' }}
                  loading={loading}
                  border
                  sorterValue={{ column: 'recorded', desc: 'true' }}
                  scopedSlots={{
                    recorded: (item) => <td>{prettyDate(item.recorded)}</td>,
                    sanity: (item) => <td>{`${item.sanity}%`}</td>,
                    show_details: (item, index) => {
                      if (item.sanity === 100) {
                        return <></>;
                      }
                      return (
                        <td className="py-2">
                          <CButton
                            color="primary"
                            variant={details.includes(index) ? '' : 'outline'}
                            shape="square"
                            size="sm"
                            onClick={() => {
                              toggleDetails(index);
                            }}
                          >
                            <CIcon name="cilList" size="lg" />
                          </CButton>
                        </td>
                      );
                    },
                    details: (item, index) => (
                      <CCollapse show={details.includes(index)}>
                        <CCardBody>
                          <h5>Details</h5>
                          <div>{getDetails(index, item.values)}</div>
                        </CCardBody>
                      </CCollapse>
                    ),
                  }}
                />
              </div>
            </CCard>
          </CCollapse>
          <CButton show={collapse ? 'true' : 'false'} color="transparent" onClick={toggle} block>
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

DeviceHealth.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceHealth;

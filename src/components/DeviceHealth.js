/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CWidgetProgress,
  CCollapse,
  CButton,
  CDataTable,
  CCard,
  CCardBody,
  CRow,
  CCol,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-widgets/DatePicker';
import { prettyDate, addDays } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';

const DeviceHealth = () => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthChecks, setHealthChecks] = useState([]);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);
  let sanityLevel;
  let barColor;

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const getDeviceHealth = () => {
    setLoading(true);
    const utcStart = new Date(start).toISOString();
    const utcEnd = new Date(end).toISOString();

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        startDate: utcStart,
        endDate: utcEnd,
      },
    };

    axiosInstance
      .get(`/device/${selectedDeviceId}/healthchecks`, options)
      .then((response) => {
        setHealthChecks(response.data.values);
      })
      .catch(() => {
      })
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
    setStart(addDays(new Date(), -3).toString());
    setEnd(new Date().toString());
  }, []);

  useEffect(() => {
    getDeviceHealth();
  }, [start, end]);

  if (healthChecks && healthChecks.length > 0) {
    sanityLevel = healthChecks[healthChecks.length-1].sanity;
    if (sanityLevel === 100) barColor = 'gradient-success';
    else if (sanityLevel >= 90) barColor = 'gradient-warning';
    else barColor = 'gradient-danger';
  }
  else{
    sanityLevel = 0;
    barColor = 'gradient-dark';
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
            <CRow style={{ marginBottom: '10px' }}>
              <CCol>
                From:
                <DatePicker
                  selected={start === '' ? new Date() : new Date(start)}
                  value={start === '' ? new Date() : new Date(start)}
                  includeTime
                  selectTime
                  onChange={(date) => setStart(date)}
                />
              </CCol>
              <CCol>
                To:
                <DatePicker
                  selected={end === '' ? new Date() : new Date(end)}
                  value={end === '' ? new Date() : new Date(end)}
                  includeTime
                  selectTime
                  onChange={(date) => setEnd(date)}
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
                            variant={details.includes(index) ? "" : "outline"}
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

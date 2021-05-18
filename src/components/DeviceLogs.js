/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CWidgetDropdown,
  CRow,
  CCol,
  CCollapse,
  CButton,
  CDataTable,
  CCard,
  CCardBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-widgets/DatePicker';
import { addDays, prettyDate } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';

const DeviceLogs = () => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const getLogs = () => {
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
      .get(`/device/${selectedDeviceId}/logs`, options)
      .then((response) => {
        setLogs(response.data.values);
      })
      .catch(() => {
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
    { key: 'log' },
    { key: 'severity' },
    { key: 'recorded' },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    getLogs();
    setStart(addDays(new Date(), -3).toString());
    setEnd(new Date().toString());
  }, []);

  useEffect(() => {
    getLogs();
  }, [start, end]);

  return (
    <CWidgetDropdown
      inverse
      color="gradient-info"
      header="Device Logs"
      footerSlot={
        <div style={{ padding: '20px' }}>
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
                  border
                  items={logs ?? []}
                  fields={columns}
                  loading={loading}
                  style={{ color: 'white' }}
                  sorterValue={{ column: 'recorded', desc: 'true' }}
                  scopedSlots={{
                    recorded: (item) => <td>{prettyDate(item.recorded)}</td>,
                    show_details: (item, index) => (
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
                    ),
                    details: (item, index) => (
                      <CCollapse show={details.includes(index)}>
                        <CCardBody>
                          <h5>Details</h5>
                          <div>
                            <pre>{JSON.stringify(item, null, 4)}</pre>
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
    >
      <CIcon name="cilList" style={{ color: 'white' }} size="lg" />
    </CWidgetDropdown>
  );
};

export default DeviceLogs;

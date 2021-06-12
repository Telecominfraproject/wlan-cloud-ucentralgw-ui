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
import { prettyDate, dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import LoadingButton from 'components/LoadingButton/LoadingButton';

const DeviceHealth = ({ selectedDeviceId }) => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthChecks, setHealthChecks] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [logLimit, setLogLimit] = useState(25);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(true);
  const [sanityLevel, setSanityLevel] = useState(null);
  const [barColor, setBarColor] = useState('gradient-dark');

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

  const showMoreLogs = () => {
    setLogLimit(logLimit + 50);
  };

  const getDeviceHealth = () => {
    if (loading) return;
    setLoadingMore(true);
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        limit: logLimit,
      },
    };

    let extraParams = '?newest=true';
    if (start !== '' && end !== '') {
      const utcStart = new Date(start).toISOString();
      const utcEnd = new Date(end).toISOString();
      options.params.startDate = dateToUnix(utcStart);
      options.params.endDate = dateToUnix(utcEnd);
      extraParams = '';
    }

    axiosInstance
      .get(`/device/${encodeURIComponent(selectedDeviceId)}/healthchecks${extraParams}`, options)
      .then((response) => {
        setHealthChecks(response.data.values);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
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
      setLogLimit(25);
      setLoadingMore(false);
      setShowLoadingMore(true);
      setStart('');
      setEnd('');
      getDeviceHealth();
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (logLimit !== 25) {
      getDeviceHealth();
    }
  }, [logLimit]);

  useEffect(() => {
    if (healthChecks.length === 0 || (healthChecks.length > 0 && healthChecks.length < logLimit)) {
      setShowLoadingMore(false);
    } else {
      setShowLoadingMore(true);
    }

    if (healthChecks && healthChecks.length > 0) {
      const sortedHealthchecks = healthChecks.sort((a, b) => (a.recorded > b.recorded ? 1 : -1));
      const tempSanityLevel = sortedHealthchecks[healthChecks.length - 1].sanity;
      setSanityLevel(tempSanityLevel);
      if (tempSanityLevel === 100) {
        setBarColor('gradient-success');
      } else if (tempSanityLevel >= 90) {
        setBarColor('gradient-warning');
      } else {
        setBarColor('gradient-danger');
      }
    } else {
      setBarColor('gradient-dark');
    }
  }, [healthChecks]);

  useEffect(() => {
    if (selectedDeviceId && start !== '' && end !== '') {
      getDeviceHealth();
    } else if (selectedDeviceId && start === '' && end === '') {
      getDeviceHealth();
    }
  }, [start, end, selectedDeviceId]);

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
                <DatePicker includeTime onChange={(date) => modifyStart(date)} />
              </CCol>
              <CCol>
                To:
                <DatePicker includeTime onChange={(date) => modifyEnd(date)} />
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
                <CRow style={{ marginBottom: '1%', marginRight: '1%' }}>
                  {showLoadingMore && (
                    <LoadingButton
                      label="View More"
                      isLoadingLabel="Loading More..."
                      isLoading={loadingMore}
                      action={showMoreLogs}
                      variant="outline"
                    />
                  )}
                </CRow>
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

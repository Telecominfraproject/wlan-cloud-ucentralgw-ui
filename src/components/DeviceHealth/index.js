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
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash } from '@coreui/icons';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import { prettyDate, dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { LoadingButton, useAuth, useDevice } from 'ucentral-libs';
import DeleteLogModal from 'components/DeleteLogModal';

const DeviceHealth = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
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
        Authorization: `Bearer ${currentToken}`,
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
      .get(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(
          deviceSerialNumber,
        )}/healthchecks${extraParams}`,
        options,
      )
      .then((response) => {
        setHealthChecks(response.data.values);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
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

  const getDetails = (index, healthCheckDetails) => {
    if (details.includes(index))
      return <pre className="ignore">{JSON.stringify(healthCheckDetails, null, 4)}</pre>;
    return <pre className="ignore" />;
  };

  const columns = [
    { key: 'UUID', label: t('common.config_id') },
    { key: 'recorded', label: t('common.recorded') },
    { key: 'sanity', label: t('health.sanity') },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    if (deviceSerialNumber) {
      setLogLimit(25);
      setLoadingMore(false);
      setShowLoadingMore(true);
      setStart('');
      setEnd('');
      getDeviceHealth();
    }
  }, [deviceSerialNumber]);

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
    if (deviceSerialNumber && start !== '' && end !== '') {
      getDeviceHealth();
    } else if (deviceSerialNumber && start === '' && end === '') {
      getDeviceHealth();
    }
  }, [start, end, deviceSerialNumber]);

  useEffect(() => {
    eventBus.on('deletedHealth', () => getDeviceHealth());

    return () => {
      eventBus.remove('deletedHealth');
    };
  }, []);

  return (
    <CWidgetDropdown
      className="m-0"
      header={t('health.title')}
      text={sanityLevel ? `${sanityLevel}%` : t('common.unknown')}
      value={sanityLevel ?? 100}
      color={barColor}
      inverse="true"
      footerSlot={
        <div className="pb-1 px-3">
          <CProgress className="mb-3" color="white" value={sanityLevel ?? 0} />
          <CRow className="mb-3">
            <CCol>
              {t('common.from')}
              :
              <DatePicker includeTime onChange={(date) => modifyStart(date)} />
            </CCol>
            <CCol>
              {t('common.to')}
              :
              <DatePicker includeTime onChange={(date) => modifyEnd(date)} />
            </CCol>
          </CRow>
          <CCard className="p-0">
            <div className="overflow-auto" style={{ height: '200px' }}>
              <CDataTable
                border
                items={healthChecks ?? []}
                fields={columns}
                className="text-white"
                loading={loading}
                sorterValue={{ column: 'recorded', desc: 'true' }}
                scopedSlots={{
                  UUID: (item) => <td className="align-middle">{item.UUID}</td>,
                  recorded: (item) => <td className="align-middle">{prettyDate(item.recorded)}</td>,
                  sanity: (item) => <td className="align-middle">{`${item.sanity}%`}</td>,
                  show_details: (item, index) => (
                    <td className="align-middle">
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
                  ),
                  details: (item, index) => (
                    <CCollapse show={details.includes(index)}>
                      <CCardBody>
                        <h5>{t('common.details')}</h5>
                        <div>{getDetails(index, item.values)}</div>
                      </CCardBody>
                    </CCollapse>
                  ),
                }}
              />
              {showLoadingMore && (
                <div className="mb-3">
                  <LoadingButton
                    label={t('common.view_more')}
                    isLoadingLabel={t('common.loading_more_ellipsis')}
                    isLoading={loadingMore}
                    action={showMoreLogs}
                    variant="outline"
                  />
                </div>
              )}
            </div>
          </CCard>
          <DeleteLogModal
            serialNumber={deviceSerialNumber}
            object="healthchecks"
            show={showDeleteModal}
            toggle={toggleDeleteModal}
          />
        </div>
      }
    >
      <div className="text-right float-right">
        <CPopover content={t('common.delete')}>
          <CButton onClick={toggleDeleteModal} size="sm">
            <CIcon name="cil-trash" content={cilTrash} className="text-white" size="2xl" />
          </CButton>
        </CPopover>
      </div>
    </CWidgetDropdown>
  );
};

export default DeviceHealth;

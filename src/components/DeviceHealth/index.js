/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CCardBody,
  CButton,
  CDataTable,
  CCardHeader,
  CPopover,
  CCard,
  CFormText,
  CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync, cilTrash } from '@coreui/icons';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import { dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { LoadingButton, useAuth, useDevice, FormattedDate } from 'ucentral-libs';
import DeleteLogModal from 'components/DeleteLogModal';

const DeviceHealth = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [loading, setLoading] = useState(false);
  const [healthChecks, setHealthChecks] = useState([]);
  const [start, setStart] = useState('');
  const [startError, setStartError] = useState(false);
  const [end, setEnd] = useState('');
  const [endError, setEndError] = useState(false);
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
    try {
      new Date(value).toISOString();
      setStartError(false);
      setStart(value);
    } catch (e) {
      setStart('');
      setStartError(true);
    }
  };

  const modifyEnd = (value) => {
    try {
      new Date(value).toISOString();
      setEndError(false);
      setEnd(value);
    } catch (e) {
      setEnd('');
      setEndError(true);
    }
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

  const columns = [
    { key: 'recorded', label: t('common.recorded'), _style: { width: '15%' } },
    { key: 'UUID', label: t('common.config_id'), _style: { width: '10%' } },
    { key: 'sanity', label: t('health.sanity'), _style: { width: '5%' } },
    { key: 'checkDetails', label: t('common.details'), _style: { width: '65%' } },
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
        setBarColor('success');
      } else if (tempSanityLevel >= 90) {
        setBarColor('warning');
      } else {
        setBarColor('danger');
      }
    } else {
      setBarColor('dark');
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
    <CCard className="m-0">
      <CCardHeader className="dark-header">
        <div className="float-left align-middle pt-1">
          <h4>
            <CBadge color={barColor} className="my-0">
              {sanityLevel ? `${sanityLevel}%` : `${t('common.unknown')} Sanity Level`}
            </CBadge>
          </h4>
        </div>
        <div className="d-flex flex-row-reverse align-items-center">
          <div className="pl-2">
            <CPopover content={t('common.refresh')}>
              <CButton
                size="sm"
                color="info"
                onClick={getDeviceHealth}
                disabled={startError || endError}
              >
                <CIcon content={cilSync} />
              </CButton>
            </CPopover>
          </div>
          <div className="pl-2">
            <DatePicker
              includeTime
              onChange={(date) => modifyEnd(date)}
              value={end ? new Date(end) : undefined}
            />
            <CFormText color="danger" hidden={!endError}>
              {t('common.invalid_date_explanation')}
            </CFormText>
          </div>
          To:
          <div className="pl-2">
            <DatePicker
              includeTime
              onChange={(date) => modifyStart(date)}
              value={start ? new Date(start) : undefined}
            />
            <CFormText color="danger" hidden={!startError}>
              {t('common.invalid_date_explanation')}
            </CFormText>
          </div>
          From:
          <div className="px-2">
            <CPopover content={t('common.delete')}>
              <CButton onClick={toggleDeleteModal} size="sm" color="danger">
                <CIcon name="cil-trash" content={cilTrash} />
              </CButton>
            </CPopover>
          </div>
        </div>
      </CCardHeader>
      <CCardBody className="p-1">
        <div className="overflow-auto" style={{ height: 'calc(100vh - 620px)' }}>
          <CDataTable
            addTableClasses="ignore-overflow table-sm"
            border
            items={healthChecks ?? []}
            fields={columns}
            className="text-white"
            loading={loading}
            sorterValue={{ column: 'recorded', desc: 'true' }}
            scopedSlots={{
              UUID: (item) => <td className="align-middle">{item.UUID}</td>,
              recorded: (item) => (
                <td className="align-middle">
                  <FormattedDate date={item.recorded} />
                </td>
              ),
              sanity: (item) => <td className="align-middle">{`${item.sanity}%`}</td>,
              checkDetails: (item) => (
                <td>
                  <pre className="my-0">{JSON.stringify(item.values)}</pre>
                </td>
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
          <DeleteLogModal
            serialNumber={deviceSerialNumber}
            object="logs"
            show={showDeleteModal}
            toggle={toggleDeleteModal}
          />
        </div>
      </CCardBody>
    </CCard>
  );
};

export default DeviceHealth;

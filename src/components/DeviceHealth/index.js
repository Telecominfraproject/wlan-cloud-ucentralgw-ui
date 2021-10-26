/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CWidgetDropdown,
  CButton,
  CDataTable,
  CCard,
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

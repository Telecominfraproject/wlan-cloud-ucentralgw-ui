/* eslint-disable no-await-in-loop */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import {
  CCard,
  CCardBody,
  CNav,
  CNavLink,
  CTabPane,
  CTabContent,
  CCardHeader,
} from '@coreui/react';
import { FirmwareList, useAuth, useToast } from 'ucentral-libs';
import FirmwareDashboard from 'components/FirmwareDashboard';
import EditFirmwareModal from 'components/EditFirmwareModal';

const FirmwareListPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState({ selected: 0 });
  const [pageCount, setPageCount] = useState(0);
  const [firmwarePerPage, setFirmwarePerPage] = useState('10');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [firmware, setFirmware] = useState([]);
  const [filteredFirmware, setFilteredFirmware] = useState([]);
  const [displayedFirmware, setDisplayedFirmware] = useState([]);
  const [displayDev, setDisplayDev] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [firmwareToEdit, setFirmwareToEdit] = useState('');

  const toggleEditModal = (id) => {
    if (id) setFirmwareToEdit(id);
    setShowEditModal(!showEditModal);
  };

  const displayFirmware = (currentPage, perPage, firmwareToDisplay) => {
    setLoading(true);

    const startIndex = currentPage.selected * perPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(perPage, 10);

    setDisplayedFirmware(firmwareToDisplay.slice(startIndex, endIndex));
    setLoading(false);
  };

  const filterFirmware = (newFirmware, displayDevDevices) => {
    let firmwareToDisplay = newFirmware;
    if (!displayDevDevices) {
      firmwareToDisplay = firmwareToDisplay.filter((i) => !i.revision.includes('devel'));
    }

    const count = Math.ceil(firmwareToDisplay.length / firmwarePerPage);
    setPageCount(count);
    setPage({ selected: 0 });
    setFilteredFirmware(firmwareToDisplay);
    displayFirmware({ selected: 0 }, firmwarePerPage, firmwareToDisplay);
  };

  const toggleDevDisplay = () => {
    setDisplayDev(!displayDev);
    filterFirmware(firmware, !displayDev);
  };

  const getPartialFirmware = async (deviceType, offset) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    return axiosInstance
      .get(
        `${endpoints.owfms}/api/v1/firmwares?deviceType=${deviceType}&limit=500&offset=${offset}`,
        {
          headers,
        },
      )
      .then((response) => response.data.firmwares)
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('common.general_error'),
          color: 'danger',
          autohide: true,
        });
        return [];
      });
  };

  const getFirmware = async (deviceType) => {
    setLoading(true);

    const allFirmwares = [];
    let continueFirmware = true;
    let i = 1;
    while (continueFirmware) {
      const newFirmwares = await getPartialFirmware(deviceType ?? selectedDeviceType, i);
      if (newFirmwares === null || newFirmwares.length === 0) continueFirmware = false;
      allFirmwares.push(...newFirmwares);
      i += 500;
    }
    const sortedFirmware = allFirmwares.sort((a, b) => {
      const firstDate = a.imageDate;
      const secondDate = b.imageDate;
      if (firstDate < secondDate) return 1;
      return firstDate > secondDate ? -1 : 0;
    });
    setFirmware(sortedFirmware);
    filterFirmware(sortedFirmware, displayDev);

    setLoading(false);
  };

  const getDeviceTypes = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.owfms}/api/v1/firmwares?deviceSet=true`, {
        headers,
      })
      .then((response) => {
        const newDeviceTypes = response.data.deviceTypes;
        setDeviceTypes(newDeviceTypes);
        setSelectedDeviceType(newDeviceTypes[0]);
        getFirmware(newDeviceTypes[0]);
      })
      .catch(() => {
        setLoading(false);
        addToast({
          title: t('common.error'),
          body: t('common.general_error'),
          color: 'danger',
          autohide: true,
        });
      });
  };

  const updateFirmwarePerPage = (value) => {
    const count = Math.ceil(filteredFirmware.length / value);
    setPageCount(count);
    setPage({ selected: 0 });

    setFirmwarePerPage(value);
    displayFirmware({ selected: 0 }, value, filteredFirmware);
  };

  const updatePage = (value) => {
    setPage(value);
    displayFirmware(value, firmwarePerPage, filteredFirmware);
  };

  const updateSelectedType = (value) => {
    setSelectedDeviceType(value);
    getFirmware(value);
  };

  useEffect(() => {
    if (selectedDeviceType === '' && !loading) getDeviceTypes();
  }, []);

  return (
    <CCard>
      <CCardHeader className="dark-header">
        <div className="text-value-lg mr-auto">{t('common.firmware')}</div>
      </CCardHeader>
      <CCardBody className="p-0">
        <CNav variant="tabs">
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 0}
            onClick={() => setIndex(0)}
          >
            {t('common.dashboard')}
          </CNavLink>
          <CNavLink
            className="font-weight-bold"
            href="#"
            active={index === 1}
            onClick={() => setIndex(1)}
          >
            {t('common.table')}
          </CNavLink>
        </CNav>
        <CTabContent>
          <CTabPane active={index === 0}>
            <FirmwareDashboard />
          </CTabPane>
          <CTabPane active={index === 1}>
            <FirmwareList
              t={t}
              loading={loading}
              page={page}
              pageCount={pageCount}
              setPage={updatePage}
              data={displayedFirmware}
              firmwarePerPage={firmwarePerPage}
              toggleEditModal={toggleEditModal}
              setFirmwarePerPage={updateFirmwarePerPage}
              selectedDeviceType={selectedDeviceType}
              deviceTypes={deviceTypes}
              setSelectedDeviceType={updateSelectedType}
              displayDev={displayDev}
              toggleDevDisplay={toggleDevDisplay}
            />
            <EditFirmwareModal
              firmwareId={firmwareToEdit}
              show={showEditModal}
              toggle={toggleEditModal}
              refreshTable={getFirmware}
            />
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  );
};

export default FirmwareListPage;

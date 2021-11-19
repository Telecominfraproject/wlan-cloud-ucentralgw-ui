import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import { BlacklistTable as Table, useAuth, useToast, useToggle } from 'ucentral-libs';
import AddToBlacklistModal from 'components/AddToBlacklistModal';
import EditBlacklistModal from 'components/EditBlacklistModal';

const BlacklistTable = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const history = useHistory();
  const [page, setPage] = useState(parseInt(sessionStorage.getItem('deviceTable') ?? 0, 10));
  const { currentToken, endpoints } = useAuth();
  const [deviceCount, setDeviceCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(getItem('devicesPerPage') || '10');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSerial, setEditSerial] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, toggleAddModal] = useToggle(false);

  const toggleEditModal = (serialNumber) => {
    if (serialNumber) setEditSerial(serialNumber);
    setShowEditModal(!showEditModal);
  };

  const getDeviceInformation = (selectedPage = page, devicePerPage = devicesPerPage) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/blacklist?limit=${devicePerPage}&offset=${
          devicePerPage * selectedPage
        }`,
        options,
      )
      .then((response) => {
        setDevices(response.data.devices);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const getCount = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/blacklist?countOnly=true`, {
        headers,
      })
      .then((response) => {
        const devicesCount = response.data.count;
        const pagesCount = Math.ceil(devicesCount / devicesPerPage);
        setPageCount(pagesCount);
        setDeviceCount(devicesCount);

        let selectedPage = page;

        if (page >= pagesCount) {
          history.push(`/devices?page=${pagesCount - 1}`);
          selectedPage = pagesCount - 1;
        }
        getDeviceInformation(selectedPage);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const refreshDevice = (serialNumber) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    let newDevice;

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/blacklist?deviceWithStatus=true&select=${encodeURIComponent(
          serialNumber,
        )}`,
        options,
      )
      .then(
        ({
          data: {
            devicesWithStatus: [device],
          },
        }) => {
          newDevice = device;

          return axiosInstance.get(
            `${endpoints.owfms}/api/v1/firmwareAge?select=${serialNumber}`,
            options,
          );
        },
      )
      .then((response) => {
        newDevice.firmwareInfo = {
          age: response.data.ages[0].age,
          latest: response.data.ages[0].latest,
        };
        const foundIndex = devices.findIndex((obj) => obj.serialNumber === serialNumber);
        const newList = devices;
        newList[foundIndex] = newDevice;
        setDevices(newList);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const updateDevicesPerPage = (value) => {
    setItem('devicesPerPage', value);
    setDevicesPerPage(value);

    const newPageCount = Math.ceil(deviceCount / value);
    setPageCount(newPageCount);

    let selectedPage = page;

    if (page >= newPageCount) {
      history.push(`/blacklist?page=${newPageCount - 1}`);
      selectedPage = newPageCount - 1;
    }

    getDeviceInformation(selectedPage, value);
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    sessionStorage.setItem('deviceTable', selectedPage);
    setPage(selectedPage);
    getDeviceInformation(selectedPage);
  };

  const removeFromBlacklist = (serialNumber) => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .delete(`${endpoints.owgw}/api/v1/blacklist/${serialNumber}`, { headers })
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('device.success_removed_blacklist'),
          color: 'success',
          autohide: true,
        });
        getCount();
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_adding_blacklist', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCount();
  }, []);

  return (
    <div>
      <Table
        currentPage={page}
        t={t}
        devices={devices}
        loading={loading}
        toggleAddBlacklist={toggleAddModal}
        toggleEditModal={toggleEditModal}
        updateDevicesPerPage={updateDevicesPerPage}
        devicesPerPage={devicesPerPage}
        pageCount={pageCount}
        updatePage={updatePageCount}
        pageRangeDisplayed={5}
        refreshDevice={refreshDevice}
        removeFromBlacklist={removeFromBlacklist}
      />
      {showAddModal ? (
        <AddToBlacklistModal show={showAddModal} toggle={toggleAddModal} refresh={getCount} />
      ) : null}
      <EditBlacklistModal
        show={showEditModal}
        toggle={toggleEditModal}
        refresh={getCount}
        serialNumber={editSerial}
      />
    </div>
  );
};

export default BlacklistTable;

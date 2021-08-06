import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import axiosInstance from 'utils/axiosInstance';
import { FirmwareList, useAuth } from 'ucentral-libs';

const FirmwareListPage = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [page, setPage] = useState({ selected: 0 });
  const [pageCount, setPageCount] = useState(0);
  const [firmwarePerPage, setFirmwarePerPage] = useState('10');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [firmware, setFirmware] = useState([]);
  const [displayedFirmware, setDisplayedFirmware] = useState([]);
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [updateDescriptionLoading, setUpdateDescriptionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    success: true,
  });

  const displayFirmware = () => {
    setLoading(true);

    const startIndex = page.selected * firmwarePerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(firmwarePerPage, 10);

    setDisplayedFirmware(firmware.slice(startIndex, endIndex));
    setLoading(false);
  };

  const getFirmware = (deviceType) => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(
        `${endpoints.ucentralfms}/api/v1/firmwares?deviceType=${deviceType ?? selectedDeviceType}`,
        {
          headers,
        },
      )
      .then((response) => {
        const sortedFirmware = response.data.firmwares.sort((a, b) => {
          const firstDate = a.imageDate;
          const secondDate = b.imageDate;
          if (firstDate < secondDate) return 1;
          return firstDate > secondDate ? -1 : 0;
        });
        setFirmware(sortedFirmware);
      })
      .catch(() => {
        setLoading(false);
        setToast({
          success: false,
          show: true,
        });
      });
  };

  const getDeviceTypes = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralfms}/api/v1/firmwares?deviceSet=true`, {
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
        setToast({
          success: false,
          show: true,
        });
      });
  };

  const updateFirmwarePerPage = (value) => {
    setFirmwarePerPage(value);
  };

  const addNote = (value, id) => {
    setAddNoteLoading(true);

    const parameters = {
      id,
      notes: [{ note: value }],
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.ucentralfms}/api/v1/firmware/${id}`, parameters, options)
      .then(() => {
        getFirmware();
        setAddNoteLoading(false);
      })
      .catch(() => {
        setAddNoteLoading(false);
        setToast({
          success: false,
          show: true,
        });
      });
  };

  const updateDescription = (value, id) => {
    setUpdateDescriptionLoading(true);

    const parameters = {
      id,
      description: value,
    };

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .put(`${endpoints.ucentralfms}/api/v1/firmware/${id}`, parameters, options)
      .then(() => {
        getFirmware();
        setUpdateDescriptionLoading(false);
      })
      .catch(() => {
        setUpdateDescriptionLoading(false);
        setToast({
          success: false,
          show: true,
        });
      });
  };

  useEffect(() => {
    if (firmware.length > 0) {
      displayFirmware();
    } else {
      setDisplayedFirmware([]);
      setLoading(false);
    }
  }, [firmware, firmwarePerPage, page]);

  useEffect(() => {
    if (selectedDeviceType === '' && !loading) getDeviceTypes();
  }, []);

  useEffect(() => {
    if (selectedDeviceType !== '') {
      getFirmware();
    }
  }, [selectedDeviceType]);

  useEffect(() => {
    if (firmware !== []) {
      const count = Math.ceil(firmware.length / firmwarePerPage);
      setPageCount(count);
      setPage({ selected: 0 });
    }
  }, [firmwarePerPage, firmware]);

  return (
    <div>
      <FirmwareList
        t={t}
        loading={loading}
        page={page}
        pageCount={pageCount}
        setPage={setPage}
        data={displayedFirmware}
        firmwarePerPage={firmwarePerPage}
        setFirmwarePerPage={updateFirmwarePerPage}
        selectedDeviceType={selectedDeviceType}
        deviceTypes={deviceTypes}
        setSelectedDeviceType={setSelectedDeviceType}
        addNote={addNote}
        addNoteLoading={addNoteLoading}
        updateDescription={updateDescription}
        updateDescriptionLoading={updateDescriptionLoading}
      />
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color={toast.success ? 'success' : 'danger'}
          className="text-white align-items-center"
          show={toast.show}
        >
          <CToastHeader closeButton>
            {toast.success ? t('common.success') : t('common.error')}
          </CToastHeader>
          <div className="d-flex">
            <CToastBody>{t('common.general_error')}</CToastBody>
          </div>
        </CToast>
      </CToaster>
    </div>
  );
};

export default FirmwareListPage;

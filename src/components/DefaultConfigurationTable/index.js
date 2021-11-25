import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import { useAuth, useToast, useToggle } from 'ucentral-libs';
import AddConfigurationModal from 'components/AddConfigurationModal';
import EditConfigurationModal from 'components/EditConfigurationModal';
import Table from './Table';

const DefaultConfigurationTable = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const history = useHistory();
  const [page, setPage] = useState(parseInt(sessionStorage.getItem('configurationTable') ?? 0, 10));
  const { currentToken, endpoints } = useAuth();
  const [configurationCount, setConfigurationCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [configurationsPerPage, setConfigurationsPerPage] = useState(
    getItem('configurationsPerPage') || '10',
  );
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, toggleAddModal] = useToggle(false);

  const toggleEditModal = (serialNumber) => {
    if (serialNumber) setEditId(serialNumber);
    setShowEditModal(!showEditModal);
  };

  const getConfigurationInformation = (
    selectedPage = page,
    configurationPerPage = configurationsPerPage,
  ) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/default_configurations?limit=${configurationPerPage}&offset=${
          configurationPerPage * selectedPage
        }`,
        options,
      )
      .then((response) => {
        setConfigurations(response.data.configurations);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('configuration.error_fetching_configurations', {
            error: e.response?.data?.ErrorDescription,
          }),
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
      .get(`${endpoints.owgw}/api/v1/default_configurations?countOnly=true`, {
        headers,
      })
      .then((response) => {
        const configurationsCount = response.data.count;
        const pagesCount = Math.ceil(configurationsCount / configurationsPerPage);
        setPageCount(pagesCount);
        setConfigurationCount(configurationsCount);

        let selectedPage = page;

        if (page >= pagesCount) {
          history.push(`/defaultconfigurations?page=${pagesCount - 1}`);
          selectedPage = pagesCount - 1;
        }
        getConfigurationInformation(selectedPage);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('configuration.error_fetching_configurations', {
            error: e.response?.data?.ErrorDescription,
          }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const updateConfigurationsPerPage = (value) => {
    setItem('configurationsPerPage', value);
    setConfigurationsPerPage(value);

    const newPageCount = Math.ceil(configurationCount / value);
    setPageCount(newPageCount);

    let selectedPage = page;

    if (page >= newPageCount) {
      history.push(`/default_configurations?page=${newPageCount - 1}`);
      selectedPage = newPageCount - 1;
    }

    getConfigurationInformation(selectedPage, value);
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    sessionStorage.setItem('configurationTable', selectedPage);
    setPage(selectedPage);
    getConfigurationInformation(selectedPage);
  };

  const deleteConfig = (name) => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .delete(`${endpoints.owgw}/api/v1/default_configuration/${name}`, { headers })
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('configuration.successful_delete'),
          color: 'success',
          autohide: true,
        });
        getCount();
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('configuration.error_adding_blacklist', {
            error: e.response?.data?.ErrorDescription,
          }),
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
        configurations={configurations}
        loading={loading}
        toggleAddBlacklist={toggleAddModal}
        toggleEditModal={toggleEditModal}
        updateConfigurationsPerPage={updateConfigurationsPerPage}
        configurationsPerPage={configurationsPerPage}
        pageCount={pageCount}
        updatePage={updatePageCount}
        pageRangeDisplayed={5}
        deleteConfig={deleteConfig}
      />
      {showAddModal ? (
        <AddConfigurationModal show={showAddModal} toggle={toggleAddModal} refresh={getCount} />
      ) : null}
      <EditConfigurationModal
        show={showEditModal}
        toggle={toggleEditModal}
        refresh={getCount}
        configId={editId}
      />
    </div>
  );
};

export default DefaultConfigurationTable;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import {
  CCardBody,
  CDataTable,
  CButton,
  CCard,
  CCardHeader,
  CPopover,
  CSelect,
  CButtonToolbar,
} from '@coreui/react';
import { cilPencil, cilPlus } from '@coreui/icons';
import ReactTooltip from 'react-tooltip';
import CIcon from '@coreui/icons-react';
import { FormattedDate } from 'ucentral-libs';
import DeleteButton from './DeleteButton';

const DefaultConfigurationTable = ({
  currentPage,
  configurations,
  toggleAddBlacklist,
  toggleEditModal,
  configurationsPerPage,
  loading,
  deleteConfig,
  updateDevicesPerPage,
  pageCount,
  updatePage,
  t,
}) => {
  const columns = [
    { key: 'name', label: t('user.name'), _style: { width: '20%' } },
    { key: 'description', label: t('user.description'), _style: { width: '20%' } },
    { key: 'created', label: t('common.created'), _style: { width: '10%' } },
    { key: 'modified', label: t('common.modified'), _style: { width: '10%' } },
    { key: 'deviceTypes', label: t('firmware.device_types'), _style: { width: '20%' } },
    { key: 'actions', label: t('actions.actions'), _style: { width: '1%' } },
  ];

  const hideTooltips = () => ReactTooltip.hide();

  const escFunction = (event) => {
    if (event.keyCode === 27) {
      hideTooltips();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, []);

  return (
    <>
      <CCard className="m-0 p-0">
        <CCardHeader className="dark-header text-right">
          <div className="text-value-lg float-left">
            {t('configuration.default_configurations')}
          </div>
          <div className="text-right float-right">
            <CPopover content={t('configuration.create_config')}>
              <CButton size="sm" color="info" onClick={toggleAddBlacklist}>
                <CIcon content={cilPlus} />
              </CButton>
            </CPopover>
          </div>
        </CCardHeader>
        <CCardBody className="p-0">
          <CDataTable
            addTableClasses="ignore-overflow table-sm"
            items={configurations ?? []}
            fields={columns}
            hover
            border
            loading={loading}
            scopedSlots={{
              name: (item) => <td className="align-middle">{item.name}</td>,
              description: (item) => <td className="align-middle">{item.description}</td>,
              deviceTypes: (item) => <td className="align-middle">{item.modelIds.join(', ')}</td>,
              created: (item) => (
                <td className="align-middle">
                  <FormattedDate date={item.created} />
                </td>
              ),
              modified: (item) => (
                <td className="align-middle">
                  <FormattedDate date={item.lastModified} />
                </td>
              ),
              actions: (item) => (
                <td className="text-center align-middle">
                  <CButtonToolbar
                    role="group"
                    className="justify-content-center"
                    style={{ width: '90px' }}
                  >
                    <DeleteButton
                      t={t}
                      config={item}
                      deleteConfig={deleteConfig}
                      hideTooltips={hideTooltips}
                    />
                    <CPopover content={t('common.edit')}>
                      <CButton
                        onClick={() => toggleEditModal(item.name)}
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        className="mx-1"
                        style={{ width: '33px', height: '30px' }}
                      >
                        <CIcon content={cilPencil} size="sm" />
                      </CButton>
                    </CPopover>
                  </CButtonToolbar>
                </td>
              ),
            }}
          />
          <div className="d-flex flex-row pl-3">
            <div className="pr-3">
              <ReactPaginate
                previousLabel="← Previous"
                nextLabel="Next →"
                pageCount={pageCount}
                onPageChange={updatePage}
                forcePage={Number(currentPage)}
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
              />
            </div>
            <p className="pr-2 mt-1">{t('common.items_per_page')}</p>
            <div style={{ width: '100px' }} className="px-2">
              <CSelect
                custom
                defaultValue={configurationsPerPage}
                onChange={(e) => updateDevicesPerPage(e.target.value)}
                disabled={loading}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </CSelect>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </>
  );
};

DefaultConfigurationTable.propTypes = {
  currentPage: PropTypes.string,
  configurations: PropTypes.instanceOf(Array).isRequired,
  toggleAddBlacklist: PropTypes.func.isRequired,
  toggleEditModal: PropTypes.func.isRequired,
  updateDevicesPerPage: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  updatePage: PropTypes.func.isRequired,
  configurationsPerPage: PropTypes.string.isRequired,
  deleteConfig: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

DefaultConfigurationTable.defaultProps = {
  currentPage: '0',
};

export default React.memo(DefaultConfigurationTable);

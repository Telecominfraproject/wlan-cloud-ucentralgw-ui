import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import {
  CCardBody,
  CDataTable,
  CButton,
  CLink,
  CCard,
  CCardHeader,
  CPopover,
  CSelect,
  CButtonToolbar,
} from '@coreui/react';
import { cilSearch, cilPencil, cilPlus, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import ReactTooltip from 'react-tooltip';
import { FormattedDate } from 'ucentral-libs';

const BlacklistTable = ({
  currentPage,
  devices,
  toggleAddBlacklist,
  toggleEditModal,
  devicesPerPage,
  loading,
  removeFromBlacklist,
  updateDevicesPerPage,
  pageCount,
  updatePage,
  t,
}) => {
  const columns = [
    { key: 'serialNumber', label: t('common.serial_number'), _style: { width: '6%' } },
    { key: 'created', label: t('device.blacklisted_on'), _style: { width: '1%' } },
    { key: 'author', label: t('common.by'), filter: false, _style: { width: '15%' } },
    { key: 'reason', label: t('common.reason'), filter: false },
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
        <CCardHeader className="p-0 text-right">
          <CPopover content={t('device.add_to_blacklist')}>
            <CButton size="sm" color="primary" onClick={toggleAddBlacklist}>
              <CIcon content={cilPlus} />
            </CButton>
          </CPopover>
        </CCardHeader>
        <CCardBody className="p-0">
          <CDataTable
            addTableClasses="ignore-overflow table-sm"
            items={devices ?? []}
            fields={columns}
            hover
            border
            loading={loading}
            scopedSlots={{
              serialNumber: (item) => (
                <td className="text-center align-middle">
                  <CLink
                    className="c-subheader-nav-link"
                    aria-current="page"
                    to={() => `/devices/${item.serialNumber}`}
                  >
                    {item.serialNumber}
                  </CLink>
                </td>
              ),
              created: (item) => (
                <td className="text-left align-middle">
                  <div style={{ width: '130px' }}>
                    <FormattedDate date={item.created} />
                  </div>
                </td>
              ),
              author: (item) => <td className="align-middle">{item.author}</td>,
              reason: (item) => <td className="align-middle">{item.reason}</td>,
              actions: (item) => (
                <td className="text-center align-middle">
                  <CButtonToolbar
                    role="group"
                    className="justify-content-center"
                    style={{ width: '130px' }}
                  >
                    <CPopover content={t('configuration.details')}>
                      <CLink
                        className="c-subheader-nav-link"
                        aria-current="page"
                        to={() => `/devices/${item.serialNumber}`}
                      >
                        <CButton
                          color="primary"
                          variant="outline"
                          shape="square"
                          size="sm"
                          className="mx-1"
                          style={{ width: '33px', height: '30px' }}
                        >
                          <CIcon name="cil-search" content={cilSearch} size="sm" />
                        </CButton>
                      </CLink>
                    </CPopover>
                    <CPopover content={t('device.remove_from_blacklist')}>
                      <CButton
                        onClick={() => removeFromBlacklist(item.serialNumber)}
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        className="mx-1"
                        style={{ width: '33px', height: '30px' }}
                      >
                        <CIcon content={cilTrash} size="sm" />
                      </CButton>
                    </CPopover>
                    <CPopover content={t('common.edit')}>
                      <CButton
                        onClick={() => toggleEditModal(item.serialNumber)}
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
                defaultValue={devicesPerPage}
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

BlacklistTable.propTypes = {
  currentPage: PropTypes.string,
  devices: PropTypes.instanceOf(Array).isRequired,
  toggleAddBlacklist: PropTypes.func.isRequired,
  toggleEditModal: PropTypes.func.isRequired,
  updateDevicesPerPage: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  updatePage: PropTypes.func.isRequired,
  devicesPerPage: PropTypes.string.isRequired,
  removeFromBlacklist: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

BlacklistTable.defaultProps = {
  currentPage: '0',
};

export default React.memo(BlacklistTable);

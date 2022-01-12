import React from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import { v4 as createUuid } from 'uuid';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CDataTable,
  CPopover,
  CSelect,
  CSwitch,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch } from '@coreui/icons';
import { CopyToClipboardButton } from 'ucentral-libs';
import { prettyDate, cleanBytesString } from 'utils/helper';

const FirmwareList = ({
  t,
  loading,
  page,
  pageCount,
  setPage,
  data,
  toggleEditModal,
  firmwarePerPage,
  setFirmwarePerPage,
  selectedDeviceType,
  deviceTypes,
  setSelectedDeviceType,
  displayDev,
  toggleDevDisplay,
}) => {
  const fields = [
    { key: 'imageDate', label: t('firmware.image_date'), _style: { width: '1%' } },
    { key: 'size', label: t('firmware.size'), _style: { width: '1%' } },
    { key: 'revision', label: t('firmware.revision'), _style: { width: '1%' } },
    { key: 'uri', label: 'URI' },
    { key: 'show_details', label: '', _style: { width: '1%' } },
  ];

  const getShortRevision = (revision) => {
    if (revision.includes(' / ')) {
      return revision.split(' / ')[1];
    }
    return revision;
  };

  const changePage = (newValue) => {
    setPage(newValue);
  };

  return (
    <CCard className="m-0">
      <CCardHeader className="p-1">
        <div className="d-flex flex-row-reverse">
          <div className="px-3">
            <CSwitch
              id="showDev"
              color="primary"
              defaultChecked={displayDev}
              onClick={toggleDevDisplay}
              size="lg"
            />
          </div>
          <div className="pr-2 pt-1">{t('firmware.show_dev')}</div>
          <div className="px-3">
            <CSelect
              custom
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
              disabled={loading}
            >
              {deviceTypes.map((deviceType) => (
                <option key={createUuid()} value={deviceType}>
                  {deviceType}
                </option>
              ))}
            </CSelect>
          </div>
          <div className="pr-2 pt-1">{t('firmware.device_type')}</div>
        </div>
      </CCardHeader>
      <CCardBody className="p-0">
        <CDataTable
          addTableClasses="table-sm"
          items={data}
          fields={fields}
          loading={loading}
          hover
          border
          scopedSlots={{
            imageDate: (item) => (
              <td className="text-center align-middle">
                <div style={{ width: '150px' }}>{prettyDate(item.imageDate)}</div>
              </td>
            ),
            size: (item) => (
              <td className="align-middle">
                <div style={{ width: '100px' }}>{cleanBytesString(item.size)}</div>
              </td>
            ),
            revision: (item) => (
              <td className="align-middle">
                <CPopover content={item.revision}>
                  <div style={{ width: 'calc(10vw)' }} className="text-truncate align-middle">
                    {item.revision ? getShortRevision(item.revision) : 'N/A'}
                  </div>
                </CPopover>
              </td>
            ),
            uri: (item) => (
              <td className="align-middle">
                <div style={{ width: 'calc(50vw)' }}>
                  <div className="text-truncate align-middle">
                    <CopyToClipboardButton key={item.uri} t={t} size="sm" content={item.uri} />
                    <CPopover content={item.uri}>
                      <span>{item.uri}</span>
                    </CPopover>
                  </div>
                </div>
              </td>
            ),
            show_details: (item) => (
              <td className="text-center align-middle">
                <CPopover content={t('common.details')}>
                  <CButton
                    size="sm"
                    color="primary"
                    variant="outline"
                    onClick={() => toggleEditModal(item.id)}
                  >
                    <CIcon content={cilSearch} />
                  </CButton>
                </CPopover>
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
              onPageChange={changePage}
              forcePage={page.selected}
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
              defaultValue={firmwarePerPage}
              onChange={(e) => setFirmwarePerPage(e.target.value)}
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
  );
};

FirmwareList.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  pageCount: PropTypes.number.isRequired,
  page: PropTypes.instanceOf(Object).isRequired,
  setPage: PropTypes.func.isRequired,
  data: PropTypes.instanceOf(Array).isRequired,
  firmwarePerPage: PropTypes.string.isRequired,
  setFirmwarePerPage: PropTypes.func.isRequired,
  selectedDeviceType: PropTypes.string.isRequired,
  deviceTypes: PropTypes.instanceOf(Array).isRequired,
  setSelectedDeviceType: PropTypes.func.isRequired,
  displayDev: PropTypes.bool.isRequired,
  toggleDevDisplay: PropTypes.func.isRequired,
  toggleEditModal: PropTypes.func.isRequired,
};

export default React.memo(FirmwareList);

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CPopover,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CDataTable,
} from '@coreui/react';
import Select from 'react-select';
import CIcon from '@coreui/icons-react';
import { cilSync, cilX } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import useToggle from 'hooks/useToggle';
import FormattedDate from 'components/FormattedDate';

const ApiStatusCard = ({ t, info, reload }) => {
  const [types, setTypes] = useState([]);
  const [showCerts, toggleCerts] = useToggle();

  const submit = () => {
    reload(
      types.map((v) => v.value),
      info.endpoint,
    );
  };

  return (
    <CCard>
      <CCardHeader className="dark-header">
        <div style={{ fontWeight: '600' }} className=" text-value-lg float-left">
          {info.title}
        </div>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('common.endpoint')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.endpoint}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('system.hostname')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.hostname}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('system.os')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.os}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('system.processors')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.processors}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('common.start')}:</div>
          </CCol>
          <CCol>
            <div block="true">
              {info.start ? <FormattedDate date={info.start} /> : t('common.unknown')}
            </div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('status.uptime')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.uptime}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('footer.version')}:</div>
          </CCol>
          <CCol>
            <div block="true">{info.version}</div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4">
            <div block="true">{t('common.certificates')}:</div>
          </CCol>
          <CCol>
            <div block="true">
              {info.certificates?.length > 0 ? (
                <CButton className="ml-0 pl-0 py-0" color="link" onClick={toggleCerts}>
                  {t('common.details')} ({info.certificates.length})
                </CButton>
              ) : (
                <div>{t('common.unknown')}</div>
              )}
            </div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="4" className="pt-1">
            <div block="true">{t('system.reload_subsystems')}:</div>
          </CCol>
          <CCol>
            <div block="true">
              {info.subsystems.length === 0 ? (
                t('common.unknown')
              ) : (
                <div>
                  <div className="float-left" style={{ width: '85%' }}>
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      name="Subsystems"
                      options={info.subsystems.map((sys) => ({ value: sys, label: sys }))}
                      onChange={setTypes}
                      value={types}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="float-left text-right" style={{ width: '15%' }}>
                    <CPopover content={t('system.reload')}>
                      <CButton
                        color="primary"
                        variant="outline"
                        onClick={submit}
                        disabled={types.length === 0}
                      >
                        <CIcon content={cilSync} />
                      </CButton>
                    </CPopover>
                  </div>
                </div>
              )}
            </div>
          </CCol>
        </CRow>
      </CCardBody>
      <CModal size="lg" show={showCerts} onClose={toggleCerts}>
        <CModalHeader className="p-1">
          <CModalTitle className="pl-1 pt-1">{t('common.certificates')}</CModalTitle>
          <div className="text-right">
            <CPopover content={t('common.close')}>
              <CButton color="primary" variant="outline" className="ml-2" onClick={toggleCerts}>
                <CIcon content={cilX} />
              </CButton>
            </CPopover>
          </div>
        </CModalHeader>
        <CModalBody>
          <CDataTable
            addTableClasses="table-sm"
            border
            items={info?.certificates.map((cert) => ({
              ...cert,
              expiresOn: prettyDate(cert.expiresOn),
            }))}
          />
        </CModalBody>
      </CModal>
    </CCard>
  );
};

ApiStatusCard.propTypes = {
  t: PropTypes.func.isRequired,
  info: PropTypes.instanceOf(Object).isRequired,
  reload: PropTypes.func.isRequired,
};

export default React.memo(ApiStatusCard);

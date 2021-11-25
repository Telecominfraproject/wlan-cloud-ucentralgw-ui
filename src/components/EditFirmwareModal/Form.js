import React from 'react';
import PropTypes from 'prop-types';
import { CCardBody, CCol, CInput, CRow } from '@coreui/react';
import { prettyDate, cleanBytesString } from 'utils/helper';

const FirmwareDetailsForm = ({ t, fields, updateFieldsWithId, editing }) => (
  <CCardBody className="p-1">
    <CRow>
      <CCol sm="2">{t('firmware.release')}</CCol>
      <CCol sm="4">{fields.release.value}</CCol>
      <CCol sm="2">{t('common.created')}</CCol>
      <CCol sm="4">{prettyDate(fields.created.value)}</CCol>
    </CRow>
    <CRow className="my-3">
      <CCol sm="2">{t('firmware.image_date')}</CCol>
      <CCol sm="4">{prettyDate(fields.imageDate.value)}</CCol>
      <CCol sm="2">{t('firmware.size')}</CCol>
      <CCol sm="4">{cleanBytesString(fields.size.value)}</CCol>
    </CRow>
    <CRow className="my-3">
      <CCol sm="2">{t('firmware.image')}</CCol>
      <CCol sm="4">{fields.image.value}</CCol>
      <CCol sm="2">{t('firmware.revision')}</CCol>
      <CCol sm="4">{fields.revision.value}</CCol>
    </CRow>
    <CRow className="my-3">
      <CCol sm="2">URI</CCol>
      <CCol sm="4">{fields.uri.value}</CCol>
      <CCol sm="2" className="mt-2">
        {t('user.description')}
      </CCol>
      <CCol sm="4">
        {editing ? (
          <CInput
            id="description"
            value={fields.description.value}
            onChange={updateFieldsWithId}
            maxLength="50"
          />
        ) : (
          <p className="mt-2 mb-0">{fields.description.value}</p>
        )}
      </CCol>
    </CRow>
  </CCardBody>
);

FirmwareDetailsForm.propTypes = {
  t: PropTypes.func.isRequired,
  fields: PropTypes.instanceOf(Object).isRequired,
  updateFieldsWithId: PropTypes.func.isRequired,
  editing: PropTypes.bool.isRequired,
};
export default FirmwareDetailsForm;

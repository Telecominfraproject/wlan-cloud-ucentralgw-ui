import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {
  CForm,
  CInput,
  CLabel,
  CCol,
  CFormGroup,
  CInvalidFeedback,
  CFormText,
  CRow,
  CTextarea,
} from '@coreui/react';
import { CopyToClipboardButton } from 'ucentral-libs';

const EditDefaultConfigurationForm = ({
  t,
  disable,
  fields,
  updateField,
  updateFieldWithKey,
  deviceTypes,
  editing,
}) => {
  const [typeOptions, setTypeOptions] = useState([]);
  const [chosenTypes, setChosenTypes] = useState([]);

  const parseOptions = () => {
    const options = [{ value: '*', label: 'All' }];
    const newOptions = deviceTypes.map((option) => ({
      value: option,
      label: option,
    }));
    options.push(...newOptions);
    setTypeOptions(options);
    setChosenTypes([]);

    const newChosenTypes = fields.modelIds.value.map((dType) => ({
      value: dType,
      label: dType === '*' ? 'All' : dType,
    }));

    setChosenTypes(newChosenTypes);
  };

  const typeOnChange = (chosenArray) => {
    const allIndex = chosenArray.findIndex((el) => el.value === '*');

    // If the All option was chosen before, we take it out of the array
    if (allIndex === 0 && chosenTypes.length > 0) {
      const newResults = chosenArray.slice(1);
      setChosenTypes(newResults);
      updateFieldWithKey('modelIds', {
        value: newResults.map((el) => el.value),
        error: false,
        notEmpty: true,
      });
    } else if (allIndex > 0) {
      setChosenTypes([{ value: '*', label: 'All' }]);
      updateFieldWithKey('modelIds', { value: ['*'], error: false, notEmpty: true });
    } else if (chosenArray.length > 0) {
      setChosenTypes(chosenArray);
      updateFieldWithKey('modelIds', {
        value: chosenArray.map((el) => el.value),
        error: false,
        notEmpty: true,
      });
    } else {
      setChosenTypes([]);
      updateFieldWithKey('modelIds', { value: [], error: false, notEmpty: true });
    }
  };

  useEffect(() => {
    parseOptions();
  }, [deviceTypes, fields.name.value]);

  return (
    <CForm>
      <CFormGroup row className="pb-3">
        <CLabel col htmlFor="name">
          {t('user.name')}
        </CLabel>
        <CCol sm="7" className="pt-2">
          {fields.name.value}
        </CCol>
      </CFormGroup>
      <CFormGroup row className="pb-3">
        <CLabel col htmlFor="description">
          {t('user.description')}
        </CLabel>
        <CCol sm="7">
          <CInput
            id="description"
            type="text"
            required
            value={fields.description.value}
            onChange={updateField}
            invalid={fields.description.error}
            disabled={disable || !editing}
            maxLength="50"
          />
          <CInvalidFeedback>{t('common.required')}</CInvalidFeedback>
        </CCol>
      </CFormGroup>
      <CRow className="pb-3">
        <CLabel col htmlFor="deviceTypes">
          <div>{t('configuration.supported_device_types')}:</div>
        </CLabel>
        <CCol sm="7">
          <Select
            isMulti
            closeMenuOnSelect={false}
            id="deviceTypes"
            options={typeOptions}
            onChange={typeOnChange}
            value={chosenTypes}
            className={`basic-multi-select ${fields.modelIds.error ? 'border-danger' : ''}`}
            classNamePrefix="select"
            isDisabled={disable || !editing}
          />
          <CFormText hidden={!fields.modelIds.error} color="danger">
            {t('configuration.need_device_type')}
          </CFormText>
        </CCol>
      </CRow>
      <div className="pb-3">
        {t('configuration.title')}
        <CopyToClipboardButton t={t} size="sm" content={fields.configuration.value} />
      </div>
      <CRow className="pb-3">
        <CCol>
          <CTextarea
            style={{ overflowY: 'scroll', height: '500px' }}
            id="configuration"
            type="text"
            required
            value={fields.configuration.value}
            onChange={updateField}
            invalid={fields.configuration.error}
            disabled={disable || !editing}
          />
          <CFormText hidden={!fields.configuration.error} color="danger">
            {t('common.required')}
          </CFormText>
        </CCol>
      </CRow>
    </CForm>
  );
};

EditDefaultConfigurationForm.propTypes = {
  t: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  fields: PropTypes.instanceOf(Object).isRequired,
  updateField: PropTypes.func.isRequired,
  updateFieldWithKey: PropTypes.func.isRequired,
  deviceTypes: PropTypes.instanceOf(Array).isRequired,
  editing: PropTypes.bool.isRequired,
};

export default EditDefaultConfigurationForm;

import React from 'react';
import PropTypes from 'prop-types';
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CLabel,
  CPopover,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import { useTranslation } from 'react-i18next';
import { CopyToClipboardButton } from 'ucentral-libs';

const ConfigurationDisplay = ({ getData, deviceConfig }) => {
  const { t } = useTranslation();
  return (
    <CCard className="m-0">
      <CCardHeader className="p-1">
        <div className="d-flex flex-row-reverse align-items-center">
          <div className="text-right">
            <CPopover content={t('common.refresh')}>
              <CButton size="sm" color="primary" variant="outline" onClick={getData}>
                <CIcon content={cilSync} />
              </CButton>
            </CPopover>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <h5>
          {t('configuration.title')}
          <CopyToClipboardButton
            t={t}
            size="sm"
            content={JSON.stringify(deviceConfig?.configuration ?? {})}
          />
        </h5>
        <CRow>
          <CCol md="2" xl="2" xxl="1">
            <CLabel>{t('configuration.last_configuration_change')}: </CLabel>
          </CCol>
          <CCol>{prettyDate(deviceConfig?.lastConfigurationChange)}</CCol>
        </CRow>
        <pre className="ignore">{JSON.stringify(deviceConfig?.configuration ?? {}, null, 4)}</pre>
      </CCardBody>
    </CCard>
  );
};

ConfigurationDisplay.propTypes = {
  getData: PropTypes.func.isRequired,
  deviceConfig: PropTypes.instanceOf(Object),
};

ConfigurationDisplay.defaultProps = {
  deviceConfig: null,
};

export default ConfigurationDisplay;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CLabel,
  CPopover,
  CSpinner,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import { useTranslation } from 'react-i18next';
import { CopyToClipboardButton, useAuth, useToast, FormattedDate } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

const CapabilitiesDisplay = ({ serialNumber }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [capabilities, setCapabilities] = useState({});
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const getCapabilities = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(serialNumber)}/capabilities`,
        options,
      )
      .then((response) => {
        setCapabilities(response.data);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_device', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCapabilities();
  }, []);

  return (
    <CCard className="m-0">
      <CCardHeader className="dark-header">
        <div className="d-flex flex-row-reverse align-items-center">
          <div className="text-right">
            <CPopover content={t('common.refresh')}>
              <CButton size="sm" color="info" onClick={getCapabilities}>
                <CIcon content={cilSync} />
              </CButton>
            </CPopover>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <h5>
          {t('device.capabilities')}
          <CopyToClipboardButton
            t={t}
            size="sm"
            content={JSON.stringify(capabilities?.capabilities ?? {})}
          />
        </h5>
        <CRow>
          <CCol>
            <CLabel>
              {t('inventory.last_modification')}: <FormattedDate date={capabilities?.lastUpdate} />
            </CLabel>
          </CCol>
        </CRow>
        {loading ? <CSpinner /> : null}
        <pre className="ignore">{JSON.stringify(capabilities?.capabilities ?? {}, null, 4)}</pre>
      </CCardBody>
    </CCard>
  );
};

CapabilitiesDisplay.propTypes = {
  serialNumber: PropTypes.string.isRequired,
};

export default CapabilitiesDisplay;

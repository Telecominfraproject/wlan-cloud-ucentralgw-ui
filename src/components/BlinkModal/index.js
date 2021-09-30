import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSwitch,
  CCol,
  CRow,
  CFormGroup,
  CInputRadio,
  CLabel,
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';
import { LoadingButton, useAuth, useDevice, useToast } from 'ucentral-libs';

const BlinkModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const { addToast } = useToast();
  const [isNow, setIsNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [chosenPattern, setPattern] = useState('on');
  const [result, setResult] = useState(null);

  const toggleNow = () => {
    setIsNow(!isNow);
  };

  const setDate = (date) => {
    if (date) {
      setChosenDate(date.toString());
    }
  };

  useEffect(() => {
    if (show) {
      setWaiting(false);
      setChosenDate(new Date().toString());
      setPattern('on');
      setResult(null);
    }
  }, [show]);

  const doAction = () => {
    setWaiting(true);
    const utcDate = new Date(chosenDate);

    const parameters = {
      serialNumber: deviceSerialNumber,
      when: isNow ? 0 : dateToUnix(utcDate),
      pattern: chosenPattern,
      duration: 30,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/leds`,
        parameters,
        { headers },
      )
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('commands.command_success'),
          color: 'success',
          autohide: true,
        });
        toggleModal();
      })
      .catch(() => {
        setResult('error');
      })
      .finally(() => {
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('blink.device_leds')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggleModal}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      {result === 'success' ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <CFormGroup row>
              <CCol md="3">
                <CLabel>{t('blink.pattern')}</CLabel>
              </CCol>
              <CCol>
                <CFormGroup variant="custom-radio" onClick={() => setPattern('on')} inline>
                  <CInputRadio
                    custom
                    defaultChecked={chosenPattern === 'on'}
                    id="radio1"
                    name="radios"
                    value="option1"
                  />
                  <CLabel variant="custom-checkbox" htmlFor="radio1">
                    {t('common.on')}
                  </CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" onClick={() => setPattern('off')} inline>
                  <CInputRadio
                    custom
                    defaultChecked={chosenPattern === 'off'}
                    id="radio2"
                    name="radios"
                    value="option2"
                  />
                  <CLabel variant="custom-checkbox" htmlFor="radio2">
                    {t('common.off')}
                  </CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" onClick={() => setPattern('blink')} inline>
                  <CInputRadio
                    custom
                    defaultChecked={chosenPattern === 'blink'}
                    id="radio3"
                    name="radios"
                    value="option3"
                  />
                  <CLabel variant="custom-checkbox" htmlFor="radio3">
                    {t('blink.blink')}
                  </CLabel>
                </CFormGroup>
              </CCol>
            </CFormGroup>
            <CRow className="pt-1">
              <CCol md="8">
                <p>{t('blink.execute_now')}</p>
              </CCol>
              <CCol>
                <CSwitch
                  disabled={waiting}
                  color="primary"
                  defaultChecked={isNow}
                  onClick={toggleNow}
                  labelOn={t('common.yes')}
                  labelOff={t('common.no')}
                />
              </CCol>
            </CRow>
            <CRow hidden={isNow} className="pt-3">
              <CCol md="4" className="pt-2">
                <p>{t('common.custom_date')}</p>
              </CCol>
              <CCol xs="12" md="8">
                <DatePicker
                  selected={new Date(chosenDate)}
                  includeTime
                  value={new Date(chosenDate)}
                  placeholder="Select custom date"
                  disabled={waiting}
                  onChange={(date) => setDate(date)}
                  min={new Date()}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <LoadingButton
              label={isNow ? t('blink.set_leds') : t('common.schedule')}
              isLoadingLabel={t('common.loading_ellipsis')}
              isLoading={waiting}
              action={doAction}
              block={false}
              disabled={waiting}
            />
            <CButton color="secondary" onClick={toggleModal}>
              {t('common.cancel')}
            </CButton>
          </CModalFooter>
        </div>
      )}
    </CModal>
  );
};

BlinkModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default BlinkModal;

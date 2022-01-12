import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { v4 as createUuid } from 'uuid';
import { CButton, CCardBody, CCardHeader, CRow, CCol, CPopover, CButtonClose } from '@coreui/react';
import { cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { LoadingButton } from 'ucentral-libs';
import PropTypes from 'prop-types';

import styles from './index.module.scss';

const DeleteButton = ({ t, config, deleteConfig, hideTooltips }) => {
  const [tooltipId] = useState(createUuid());

  return (
    <CPopover content={t('common.delete')}>
      <div className="d-inline">
        <CButton
          color="primary"
          variant="outline"
          shape="square"
          size="sm"
          className="mx-2"
          data-tip
          data-for={tooltipId}
          data-event="click"
          style={{ width: '33px', height: '30px' }}
        >
          <CIcon name="cil-trash" content={cilTrash} size="sm" />
        </CButton>
        <ReactTooltip
          id={tooltipId}
          place="top"
          effect="solid"
          globalEventOff="click"
          clickable
          className={[styles.deleteTooltip, 'tooltipRight'].join(' ')}
          border
          borderColor="#321fdb"
          arrowColor="white"
          overridePosition={({ left, top }) => {
            const element = document.getElementById(tooltipId);
            const tooltipWidth = element ? element.offsetWidth : 0;
            const newLeft = left - tooltipWidth * 0.25;
            return { top, left: newLeft };
          }}
        >
          <CCardHeader color="primary" className={styles.tooltipHeader}>
            {t('configuration.delete_config')}
            <CButtonClose
              style={{ color: 'white' }}
              onClick={(e) => {
                e.target.parentNode.parentNode.classList.remove('show');
                hideTooltips();
              }}
            />
          </CCardHeader>
          <CCardBody className="py-1 px-4">
            <CRow>
              <CCol>
                <LoadingButton
                  data-toggle="dropdown"
                  variant="outline"
                  color="danger"
                  label={t('common.confirm')}
                  isLoadingLabel={t('user.deleting')}
                  isLoading={false}
                  action={() => deleteConfig(config.name)}
                  block
                  disabled={false}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </ReactTooltip>
      </div>
    </CPopover>
  );
};

DeleteButton.propTypes = {
  t: PropTypes.func.isRequired,
  config: PropTypes.instanceOf(Object).isRequired,
  deleteConfig: PropTypes.func.isRequired,
  hideTooltips: PropTypes.func.isRequired,
};

export default DeleteButton;

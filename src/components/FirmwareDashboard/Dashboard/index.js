import React from 'react';
import PropTypes from 'prop-types';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CPopover,
  CRow,
  CSpinner,
  CWidgetIcon,
} from '@coreui/react';
import { CChartBar, CChartHorizontalBar, CChartPie } from '@coreui/react-chartjs';
import { cilClock, cilHappy, cilMeh, cilFrown, cilBirthdayCake, cilInfo } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { FormattedDate } from 'ucentral-libs';

import styles from './index.module.scss';

const getLatestColor = (percent = 0) => {
  const numberPercent = percent ? Number(percent.replace('%', '')) : 0;
  if (numberPercent >= 90) return 'success';
  if (numberPercent > 60) return 'warning';
  return 'danger';
};

const getLatestIcon = (percent = 0) => {
  const numberPercent = percent ? Number(percent.replace('%', '')) : 0;
  if (numberPercent >= 90) return <CIcon width={36} name="cil-happy" content={cilHappy} />;
  if (numberPercent > 60) return <CIcon width={36} name="cil-meh" content={cilMeh} />;
  return <CIcon width={36} name="cil-frown" content={cilFrown} />;
};

const FirmwareDashboard = ({ t, data, loading }) => {
  const columns = [
    { key: 'endpoint', label: t('common.endpoint'), filter: false, sorter: false },
    { key: 'devices', label: t('common.devices') },
    { key: 'percent', label: '' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ opacity: loading ? '20%' : '100%' }}>
        <CRow className="mt-3">
          <CCol>
            <CWidgetIcon
              text={t('common.last_dashboard_refresh')}
              header={data.snapshot ? <FormattedDate date={data.snapshot} size="lg" /> : <h2>-</h2>}
              color="info"
              iconPadding={false}
            >
              <CIcon width={36} name="cil-clock" content={cilClock} />
            </CWidgetIcon>
          </CCol>
          <CCol>
            <CWidgetIcon
              text={t('common.up_to_date')}
              header={<h2>{data.latestSoftwareRate}</h2>}
              color={getLatestColor(data.latestSoftwareRate)}
              iconPadding={false}
            >
              {getLatestIcon(data.latestSoftwareRate)}
            </CWidgetIcon>
          </CCol>
          <CCol>
            <CWidgetIcon
              text={t('common.devices')}
              header={<h2>{data.numberOfDevices}</h2>}
              color="primary"
              iconPadding={false}
            >
              <CIcon width={36} name="cil-router" />
            </CWidgetIcon>
          </CCol>
          <CCol>
            <CWidgetIcon
              text={
                <div>
                  <div className="float-left">{t('firmware.average_age')}</div>
                  <div className="float-left ml-2">
                    <CPopover content={t('firmware.age_explanation')}>
                      <CIcon content={cilInfo} />
                    </CPopover>
                  </div>
                </div>
              }
              header={<h2>{data.averageFirmwareAge}</h2>}
              color="dark"
              iconPadding={false}
            >
              <CIcon width={36} content={cilBirthdayCake} />
            </CWidgetIcon>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">{t('common.firmware_installed')}</CCardHeader>
              <CCardBody>
                <CChartPie
                  datasets={data.firmwareDistribution.datasets}
                  labels={data.firmwareDistribution.labels}
                  options={{
                    legend: {
                      display: true,
                      position: 'right',
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">
                <div>
                  <div className="float-left">{t('common.devices_using_latest')}</div>
                  <div className="float-left ml-2">
                    <CPopover content={t('firmware.latest_explanation')}>
                      <CIcon content={cilInfo} />
                    </CPopover>
                  </div>
                </div>
              </CCardHeader>
              <CCardBody>
                <CChartBar
                  datasets={data.latest.datasets}
                  labels={data.latest.labels}
                  options={{
                    tooltips: {
                      mode: 'index',
                      intersect: false,
                    },
                    hover: {
                      mode: 'index',
                      intersect: false,
                    },
                    legend: {
                      display: false,
                      position: 'right',
                    },
                    scales: {
                      yAxes: [
                        {
                          ticks: {
                            maxTicksLimit: 5,
                            beginAtZero: true,
                            stepSize: 1,
                          },
                        },
                      ],
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">Unknown Firmware</CCardHeader>
              <CCardBody>
                <CChartHorizontalBar
                  datasets={data.unknownFirmwares.datasets}
                  labels={data.unknownFirmwares.labels}
                  options={{
                    tooltips: {
                      mode: 'index',
                      intersect: false,
                    },
                    hover: {
                      mode: 'index',
                      intersect: false,
                    },
                    legend: {
                      display: false,
                      position: 'right',
                    },
                    scales: {
                      xAxes: [
                        {
                          ticks: {
                            maxTicksLimit: 5,
                            beginAtZero: true,
                            stepSize: 1,
                          },
                        },
                      ],
                      yAxes: [
                        {
                          ticks: {
                            callback: (value) => value.split(' ')[0],
                          },
                        },
                      ],
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">{t('common.device_status')}</CCardHeader>
              <CCardBody>
                <CChartPie
                  datasets={data.status.datasets}
                  labels={data.status.labels}
                  options={{
                    tooltips: {
                      callbacks: {
                        title: (item, ds) => ds.labels[item[0].index],
                        label: (item, ds) => `${ds.datasets[0].data[item.index]}%`,
                      },
                    },
                    legend: {
                      display: true,
                      position: 'right',
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">{t('firmware.device_types')}</CCardHeader>
              <CCardBody>
                <CChartPie
                  datasets={data.deviceType.datasets}
                  labels={data.deviceType.labels}
                  options={{
                    tooltips: {
                      callbacks: {
                        title: (item, ds) => ds.labels[item[0].index],
                        label: (item, ds) =>
                          `${ds.datasets[0].data[item.index]} ${t('common.devices')}`,
                      },
                    },
                    legend: {
                      display: true,
                      position: 'right',
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">OUIs</CCardHeader>
              <CCardBody>
                <CChartHorizontalBar
                  datasets={data.ouis.datasets}
                  labels={data.ouis.labels}
                  options={{
                    tooltips: {
                      mode: 'index',
                      intersect: false,
                    },
                    hover: {
                      mode: 'index',
                      intersect: false,
                    },
                    legend: {
                      display: false,
                      position: 'right',
                    },
                    scales: {
                      xAxes: [
                        {
                          ticks: {
                            maxTicksLimit: 5,
                            beginAtZero: true,
                            stepSize: 1,
                          },
                        },
                      ],
                      yAxes: [
                        {
                          ticks: {
                            callback: (value) => value.split(' ')[0],
                          },
                        },
                      ],
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader className="dark-header">{t('common.endpoints')}</CCardHeader>
              <CCardBody>
                <CDataTable
                  addTableClasses="table-sm"
                  items={data.endpoints ?? []}
                  fields={columns}
                  hover
                  border
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol />
          <CCol />
        </CRow>
      </div>
      {loading ? (
        <div className={styles.centerContainer}>
          <CSpinner className={styles.spinner} />
        </div>
      ) : null}
    </div>
  );
};

FirmwareDashboard.propTypes = {
  t: PropTypes.func.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default React.memo(FirmwareDashboard);

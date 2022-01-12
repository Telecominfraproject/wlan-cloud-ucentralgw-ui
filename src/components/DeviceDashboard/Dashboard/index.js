import React from 'react';
import PropTypes from 'prop-types';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CPopover,
  CRow,
  CSpinner,
  CWidgetIcon,
} from '@coreui/react';
import { CChartBar, CChartHorizontalBar, CChartPie } from '@coreui/react-chartjs';
import { cilClock, cilInfo, cilMedicalCross, cilThumbUp, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { FormattedDate } from 'ucentral-libs';

import styles from './index.module.scss';

const getColor = (health) => {
  const numberHealth = health ? Number(health.replace('%', '')) : 0;
  if (numberHealth >= 90) return 'success';
  if (numberHealth >= 60) return 'warning';
  return 'danger';
};

const getIcon = (health) => {
  const numberHealth = health ? Number(health.replace('%', '')) : 0;
  if (numberHealth >= 90) return <CIcon width={36} name="cil-thumbs-up" content={cilThumbUp} />;
  if (numberHealth >= 60) return <CIcon width={36} name="cil-warning" content={cilWarning} />;
  return <CIcon width={36} name="cil-medical-cross" content={cilMedicalCross} />;
};

const DeviceDashboard = ({ t, data, loading }) => (
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
            text={
              <div>
                <div className="float-left">{t('common.overall_health')}</div>
                <div className="float-left ml-2">
                  <CPopover content={t('device.health_explanation')}>
                    <CIcon content={cilInfo} />
                  </CPopover>
                </div>
              </div>
            }
            header={<h2>{data.overallHealth}</h2>}
            color={getColor(data.overallHealth)}
            iconPadding={false}
          >
            {getIcon(data.overallHealth)}
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
      </CRow>
      <CRow>
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">{t('common.device_status')}</CCardHeader>
            <CCardBody className="p-1">
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">
              <div>
                <div className="float-left">{t('common.device_health')}</div>
                <div className="float-left ml-2">
                  <CPopover content={t('device.health_explanation')}>
                    <CIcon content={cilInfo} />
                  </CPopover>
                </div>
              </div>
            </CCardHeader>
            <CCardBody className="p-1">
              <CChartPie
                datasets={data.healths.datasets}
                labels={data.healths.labels}
                options={{
                  tooltips: {
                    callbacks: {
                      title: (item, ds) => ds.labels[item[0].index],
                      label: (item, ds) =>
                        `${ds.datasets[0].data[item.index]}${t('common.of_connected')}`,
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">
              {data.totalAssociations}{' '}
              {data.totalAssociations === 1
                ? t('wifi_analysis.association')
                : t('wifi_analysis.associations')}
            </CCardHeader>
            <CCardBody className="p-1">
              <CChartPie
                datasets={data.associations.datasets}
                labels={data.associations.labels}
                options={{
                  tooltips: {
                    callbacks: {
                      title: (item, ds) => ds.labels[item[0].index],
                      label: (item, ds) =>
                        `${ds.datasets[0].data[item.index]}% of ${
                          data.totalAssociations
                        } associations`,
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">{t('common.vendors')}</CCardHeader>
            <CCardBody className="p-1">
              <CChartHorizontalBar
                datasets={data.vendors.datasets}
                labels={data.vendors.labels}
                options={{
                  tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      title: (item, ds) => ds.labels[item[0].index],
                      label: (item, ds) =>
                        `${ds.datasets[0].data[item.index]} ${t('common.devices')}`,
                    },
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">{t('firmware.device_types')}</CCardHeader>
            <CCardBody className="p-1">
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">
              <div>
                <div className="float-left">{t('common.uptimes')}</div>
                <div className="float-left ml-2">
                  <CPopover content={t('device.uptimes_explanation')}>
                    <CIcon content={cilInfo} />
                  </CPopover>
                </div>
              </div>
            </CCardHeader>
            <CCardBody className="p-1">
              <CChartBar
                datasets={data.upTimes.datasets}
                labels={data.upTimes.labels}
                options={{
                  tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      title: (item, ds) => ds.labels[item[0].index],
                      label: (item, ds) =>
                        `${ds.datasets[0].data[item.index]} ${t('common.devices')}`,
                    },
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">
              <div>
                <div className="float-left">{t('common.certificates')}</div>
                <div className="float-left ml-2">
                  <CPopover content={t('device.certificate_explanation')}>
                    <CIcon content={cilInfo} />
                  </CPopover>
                </div>
              </div>
            </CCardHeader>
            <CCardBody className="p-1">
              <CChartPie
                datasets={data.certificates.datasets}
                labels={data.certificates.labels}
                options={{
                  tooltips: {
                    callbacks: {
                      title: (item, ds) => ds.labels[item[0].index],
                      label: (item, ds) =>
                        `${ds.datasets[0].data[item.index]}${t('common.of_connected')}`,
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">{t('common.commands')}</CCardHeader>
            <CCardBody className="p-1">
              <CChartBar
                datasets={data.commands.datasets}
                labels={data.commands.labels}
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
        <CCol lg="6" xl="4">
          <CCard>
            <CCardHeader className="dark-header">
              <div>
                <div className="float-left">{t('common.memory_used')}</div>
                <div className="float-left ml-2">
                  <CPopover content={t('device.memory_explanation')}>
                    <CIcon content={cilInfo} />
                  </CPopover>
                </div>
              </div>
            </CCardHeader>
            <CCardBody className="p-1">
              <CChartBar
                datasets={data.memoryUsed.datasets}
                labels={data.memoryUsed.labels}
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
                          maxTicksLimit: 10,
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
      </CRow>
    </div>
    {loading ? (
      <div className={styles.centerContainer}>
        <CSpinner className={styles.spinner} />
      </div>
    ) : null}
  </div>
);

DeviceDashboard.propTypes = {
  t: PropTypes.func.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default React.memo(DeviceDashboard);

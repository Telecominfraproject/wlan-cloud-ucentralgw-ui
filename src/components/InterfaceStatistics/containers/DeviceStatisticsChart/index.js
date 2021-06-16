import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import styles from './index.module.scss';

const DeviceStatisticsChart = ({ data, options }) => (
  <div className={styles.chart}>
    <Chart series={data} options={options} type="line" height="100%" />
  </div>
);

DeviceStatisticsChart.propTypes = {
  data: PropTypes.instanceOf(Array),
  options: PropTypes.instanceOf(Object),
};

DeviceStatisticsChart.defaultProps = {
  data: [],
  options: {},
};

export default DeviceStatisticsChart;

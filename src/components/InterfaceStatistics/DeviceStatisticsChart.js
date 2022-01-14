import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';

const DeviceStatisticsChart = ({ chart }) => (
  <div style={{ height: '360px' }}>
    <Chart series={chart.data} options={chart.options} type="line" height="100%" />
  </div>
);

DeviceStatisticsChart.propTypes = {
  chart: PropTypes.instanceOf(Object).isRequired,
};

export default React.memo(DeviceStatisticsChart);

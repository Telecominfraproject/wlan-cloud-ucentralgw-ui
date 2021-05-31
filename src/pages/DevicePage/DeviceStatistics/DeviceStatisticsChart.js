import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts'

const DeviceStatisticsChart = ({ data, options }) => (
    <div style={{height: '360px'}}>
        <Chart
            series={data}
            options={options}
            type='line'
            height='100%'
        />
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
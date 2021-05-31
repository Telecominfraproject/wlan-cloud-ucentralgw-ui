import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts'

const DeviceStatisticsChart = ({ data, options }) => (
    <div>
        <Chart
            series={data}
            options={options}
            type='line'
            height={360}
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
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { IStatisticsData } from '../statistics';
import { data } from 'react-router-dom';

interface BGBarChartProps {
  data: IStatisticsData|undefined;
}

const BGBarChart: React.FC<BGBarChartProps> = ({data}) => {
  const series = data?.series || [];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 2,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: data?.barName || [],
    },
    yaxis: {
      title: {
        text: 'mission',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number): string => {
          return val + ' mission';
        },
      },
    },
  };

  return (
    // <div style={{ width: '100%', height: '70%' }}>
     <ReactApexChart options={options} series={series} type="bar" height="80%" />
    // </div>
  );
};

export default BGBarChart;

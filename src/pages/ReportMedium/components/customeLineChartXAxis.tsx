import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';

interface IProps {
  xAxisData: string[],
}

const option = {
  grid: {
    top: '0',
    left: '100',
    right: '100',
    bottom: '0',
    height: '10',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: {  
      show: false // 隐藏X轴线  
    },  
    axisTick: {  
      show: false // 隐藏X轴刻度尺  
    }, 
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'line',
      smooth: true,
    }
  ]
};


const AreaBasicChart: React.FC<IProps> = ({ xAxisData } : IProps) => {
  //拿到DOM容器
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    chartRef.current.removeAttribute('_echarts_instance_');
    const chart = echarts.init(chartRef.current, {}, {
      renderer: 'canvas',
      useDirtyRect: false,
      height: 30
    }); 
    chart.setOption(option);
    chartsResize(chart);
  }, [xAxisData]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const existEchartsInstance = echarts.getInstanceByDom(chartRef.current);
    existEchartsInstance?.setOption({
      xAxis: {
        data: xAxisData
      }
    });
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisData]); // 每当props改变的时候就会实时重新渲染

  return <div ref={chartRef} style={{width:'100%', height:'100%'}}></div>;
};

export default AreaBasicChart;

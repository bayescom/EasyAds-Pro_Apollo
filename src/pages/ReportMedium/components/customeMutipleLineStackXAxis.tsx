import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';

interface IProps {
  xAxisData: string [],
  shouldResize?: boolean,
  customHeight?: number,
  seriesData: seriesDataType [],
}

const colors = [  
  '#FF00FF', // 红色  
  '#00FF00', // 绿色  
  '#9370DB', // 蓝色  
  '#FFFF00', // 黄色  
  '#00FFFF', // 青色（蓝绿色）  
  '#FF00FF', // 紫色（洋红）  
  '#800000', // 深红色  
  '#008000', // 深绿色  
  '#000080', // 深蓝色  
  '#FFA500'  // 橙色  
];

type seriesDataType = {
  name: string,
  type: string
}

const option = {
  color: colors,
  legend: {
    x: 'center',
    y: '30',
    selectedMode: false, // 是否允许点击
  },
  grid: {
    left: '100', 
    right: '100', 
    top: '5px', 
    bottom: '70px', 
    containLabel: false
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLine: {  
      show: false // 隐藏X轴线  
    },  
    axisTick: {  
      show: false // 隐藏X轴刻度尺  
    }, 
  },
  yAxis: {
    type: 'value',
  }
};

const MutipleLineStack: React.FC<IProps> = ({ shouldResize, xAxisData, seriesData } : IProps) => {
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
      height: 70,
    }); 
    // 会出现数据累计的情况，使用clear每次都重新渲染
    chart.clear();

    chart.setOption(option);

    // 这个是为了解决切换tab的时候，图表的宽度初始化只有100px的问题
    setTimeout(() => {
      chart.resize();
      chartsResize(chart);
    }, 0);
    
  }, [shouldResize, xAxisData, seriesData]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    let existEchartsInstance = echarts.getInstanceByDom(chartRef.current);
    if (existEchartsInstance == null) {
      existEchartsInstance = echarts.init(chartRef.current, {}, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: 70,
      });
    }

    existEchartsInstance?.setOption({
      xAxis: {
        data: xAxisData,
      },
      series: seriesData || [],
    });
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisData, seriesData]); // 每当props改变的时候就会实时重新渲染
  return <div ref={chartRef} style={{width:'100%', height:'100%'}}></div>;
};

export default MutipleLineStack;

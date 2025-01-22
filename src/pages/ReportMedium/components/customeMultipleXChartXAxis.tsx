import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';


// 两个X轴，就有四个 datalist
interface IProps {
  /**
   * X轴上的两个数组
   */
  xAxisDataTop: string [],
  xAxisDataBottom: string [],
  shouldResize?: boolean,
  /**
   * 时间对比左侧 时间数组，格式为：['2022-10-16', '2022-10-18']
   */
  leftTime: string [],
  /**
   * 时间对比右侧 时间数组，格式为：['2022-10-13', '2022-10-15']
   */
  rightTime: string [],
}
const colors = ['#5470C6', '#EE6666'];
const option = {
  grid: {
    left: '100', 
    right: '100', 
    top: '0', 
    bottom: '35', 
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      axisLine: {  
        show: false // 隐藏X轴线  
      },  
      axisTick: {  
        show: false // 隐藏X轴刻度尺  
      },
      boundaryGap: false,
    },
    {
      type: 'category',
      axisLine: {  
        show: false // 隐藏X轴线  
      },  
      axisTick: {  
        show: false // 隐藏X轴刻度尺  
      }, 
      position: 'bottom',
      offset: 20,
      boundaryGap: false,
    }
  ],
  yAxis: [
    {
      type: 'value',
    },
  ],
  legend: {
    x: 'center',
    y: 40,
    selectedMode: false
  },
  series: [
    {
      type: 'line',
      xAxisIndex: 0,
      smooth: true,
      emphasis: {
        focus: 'series'
      }
    },
    {
      type: 'line',
      xAxisIndex: 1,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
    }
  ]
};

const Index: React.FC<IProps> = ({ xAxisDataTop, xAxisDataBottom, shouldResize, leftTime, rightTime } : IProps) => {
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
      height: 70
    }); 

    chart.setOption(option);
    setTimeout(() => {
      chart.resize();
      chartsResize(chart);
    }, 0);
  }, [shouldResize, xAxisDataTop, xAxisDataBottom, leftTime, rightTime]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const existEchartsInstance = echarts.getInstanceByDom(chartRef.current);

    existEchartsInstance?.setOption({
      xAxis: [
        {
          data: xAxisDataTop,
        },
        {
          data: xAxisDataBottom,
        },
      ],
      series: [
        {
          name:`${leftTime[0]} ~ ${leftTime[1]}`,
          type: 'line',
          color: '#3796D7',
        },
        {
          name: `${rightTime[0]} ~ ${rightTime[1]}`,
          type: 'line',
          color: '#aaa'
        }
      ],
    });
    
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisDataTop, xAxisDataBottom, leftTime, rightTime]); // 每当props改变的时候就会实时重新渲染
  return <div ref={chartRef} style={{width:'100%', height:'100%'}}></div>;
};

export default Index;

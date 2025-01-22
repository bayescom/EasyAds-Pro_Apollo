import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';
import { formatData } from '@/services/utils/utils';
import { DimensionOption } from '@/models/types/common';
import styles from './index.module.less';

interface IProps {
  xAxisData: string[],
  seriesData: number[],
  isMoney?: boolean,
  seriesColor?: string,
  yAxisObj: DimensionOption,
  total: string,
  customHeight?: number,
}

const option = {
  grid: {
    top: '15',
    left: '100',
    right: '100',
    bottom: '15',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
   
    axisLabel: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    splitLine: { show: true } //去除网格线
  },
  yAxis: {
    type: 'value',
    min: 0, //就是这两个 最小值
    max: 'dataMax', //最大值
    scale:true,
    position: 'right',
    splitNumber: 1,//分割成几段
    splitLine: { show: true }, //去除网格线
  },
  series: [
    {
      type: 'line',
      // smooth: true,
      areaStyle: {
        color: '#E1F1FC',
      },
      lineStyle: {
        width: 1.5,
        color: '#3796D7'
      },
      showSymbol: false
    }
  ]
};


const AreaBasicChart: React.FC<IProps> = ({ xAxisData, seriesData, isMoney, seriesColor, yAxisObj, total, customHeight } : IProps) => {
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
      height: customHeight ? customHeight : 80,
    });

    // 会出现数据累计的情况，使用clear每次都重新渲染
    chart.clear();

    chart.setOption(option, true);

    // 这个是为了解决切换tab的时候，图表的宽度初始化只有100px的问题
    setTimeout(() => {
      chart.resize();
      chartsResize(chart);
    }, 0);
  }, [customHeight, seriesData]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const existEchartsInstance = echarts.getInstanceByDom(chartRef.current);
    const yAxisTotal =  yAxisObj.format == 'percent' ? total : (yAxisObj.format == 'rmbYuan' ? formatData(total, 2) : formatData(total, 0));
    existEchartsInstance?.setOption({
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: function (params) {
          let str = params[0].name + '<br/>';
          params.forEach(item => {
            if (item.data !== null && item.data !== undefined) {
              if (yAxisObj.format == 'percent') {
                str += item.marker + yAxisObj.name + '：' + formatData(item.data * 100, 2) + '%' + '<br/>';
              } else if (yAxisObj.format == 'rmbYuan') {
                str += item.marker + yAxisObj.name + '：' + formatData(item.data, 2) + '<br/>';
              } else {
                str += item.marker + yAxisObj.name + '：' + formatData(item.data, 0)+ '<br/>';
              }
            }
          });
          return str;
        }
      },
      xAxis: {
        data: xAxisData
      },
      series: [{
        data: seriesData,
        color: '#5874C7',
      }],
      graphic: [
        {  
          type: 'text',  
          top: 10, 
          left: 20, 
          style: {
            text: yAxisObj.name ,  
          }  
        },
        {  
          type: 'text',  
          top: 30, 
          left: 20, 
          style: {
            text: yAxisTotal,  
          }  
        }
      ],
      yAxis: [
        {
          name: yAxisObj.name,
          axisLabel: {
            formatter: (value) => {
              return yAxisObj.format == 'rmbYuan' ? `¥${formatData(value, 2)}` : (yAxisObj.format == 'percent' ? `${(Number(value)* 100).toFixed(0)} %` : formatData(value, 0));
            }
          },
          axisLine: {show:false},
          axisTick: {show:false},
        },
      ]
    });
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisData, seriesData, isMoney, seriesColor, yAxisObj, total, customHeight]); // 每当props改变的时候就会实时重新渲染

  return <div ref={chartRef} style={{width:'100%', height:'100%'}} className={styles['canvas-container']}></div>;
};

export default AreaBasicChart;

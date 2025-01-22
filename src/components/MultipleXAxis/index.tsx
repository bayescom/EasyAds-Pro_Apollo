import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';
import { formatData } from '@/services/utils/utils';
import { DimensionOption } from '@/models/types/common';
import styles from './index.module.less';

type CompareDataType = {
  basic: number | string,
  contrast: number | string,
  crease: number | string,
  ratio: string,
  trend: number,
}

// 两个X轴，就有四个 datalist
interface IProps {
  /**
   * X轴上的两个数组
   */
  xAxisDataTop: string [],
  xAxisDataBottom: string [],
  /**
   * Y 轴上的两个数组
  */
  seriesTop: number [],
  seriesBottom: number [],
  yAxisObj: DimensionOption,
  /**
   * 时间对比左侧 时间数组，格式为：['2022-10-16', '2022-10-18']
   */
  leftTime: string [],
  /**
   * 时间对比右侧 时间数组，格式为：['2022-10-13', '2022-10-15']
   */
  rightTime: string [],
  shouldResize?: boolean,
  // 是否显示X轴，默认显示
  isHideXAxisLabel?: boolean,
  customeHeight?: number,
  compareData: CompareDataType,
}
const colors = ['#3796D7', '#ccc'];
const option = {
  color: colors,
  grid: {
    left: '20px', 
    right: '20px', 
    top: '40px', 
    bottom: '30px', 
    containLabel: true
  },
  legend: {
    x: 'center',
    y: 'bottom'
  },
  xAxis: [
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        onZero: false,
      },
      boundaryGap: false,
    },
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true,
        show: false
      },
      axisLine: {
        onZero: false,
        show: false
      },
      position: 'bottom',
      offset: 20,
      boundaryGap: false,
    }
  ],
  yAxis: [
    {
      type: 'value',
      min: 0, //就是这两个 最小值
      max: 'dataMax', //最大值
      scale: true,
      axisLine: {
        lineStyle: {
          color: 'gray',
          width: 1, //这里是为了突出显示加上的  
        }
      },
    },
  ],
  series: [
    {
      type: 'line',
      xAxisIndex: 0,
      // smooth: true,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        width: 1.5,
      },
      showSymbol: false
    },
    {
      type: 'line',
      xAxisIndex: 1,
      // smooth: true,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        width: 1.5,
      },
      showSymbol: false
    }
  ]
};

const format = (obj, total) => {
  if (obj.format) {
    if (obj.format == 'rmbYuan') {
      return formatData(total, 2);
    } else {
      return total;
    }
  } else {
    return formatData(total, 0);
  }
};

const MultipleYAxis: React.FC<IProps> = ({ xAxisDataTop, xAxisDataBottom, seriesTop, seriesBottom, yAxisObj, leftTime, rightTime, shouldResize, isHideXAxisLabel, customeHeight, compareData } : IProps) => {
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
      height: customeHeight || 430
    }); 

    // 会出现数据累计的情况，使用clear每次都重新渲染
    chart.clear();
    chart.setOption(option);
    setTimeout(() => {
      chart.resize();
      chartsResize(chart);
    }, 0);
  }, [shouldResize, customeHeight]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const existEchartsInstance = echarts.getInstanceByDom(chartRef.current);

    existEchartsInstance?.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          if (params) {
            let htmlStr = '';
            htmlStr += yAxisObj.name;
            const basicValue = params[0].value;
            const compareValue = params[1].value;
            const creaseValue = (basicValue - compareValue);
            const ratio = basicValue ? (creaseValue * 100 / compareValue).toFixed(2) : '-100.00';
            for (let i = 0; i < params.length; i++) {
              const param = params[i]; // 存一份item项
              const seriesName = param.name; //图例名称
              const value = echarts.format.addCommas(param.value); //y轴值
              const color = param.color; //图例颜色
              htmlStr += '<div>';
              htmlStr +=
                '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                color +
                ';"></span>';
              //圆点后面显示的文本
              htmlStr += seriesName + '：' + (yAxisObj.format == 'percent' ? `${(Number(value) * 100).toFixed(2)} %` : value);
            }
            htmlStr += '<p>';
            htmlStr += (yAxisObj.format == 'percent' ? `${(Number(basicValue) * 100).toFixed(2)}%` : echarts.format.addCommas(basicValue));
            htmlStr += Number(ratio) >0 ?
              ('<span style="color: red;">'
                + '▲'
                + echarts.format.addCommas(yAxisObj.format ? (yAxisObj.format == 'percent' ? ((Number(creaseValue.toFixed(4)) * 100).toFixed(2) + '%') : creaseValue.toFixed(2)) : creaseValue) + '(' + ratio + '%' + ')'
                + '</span>') : ('<span style="color: green;">'
                + '▼' 
                + echarts.format.addCommas(yAxisObj.format ? (yAxisObj.format == 'percent' ? ((Number(creaseValue.toFixed(4)) * 100).toFixed(2) + '%') : creaseValue.toFixed(2)) : creaseValue) + '(' + ratio + '%' + ')'
                + '</span>');
            htmlStr += '</p></div>';
            return htmlStr;
          } else {
            return;
          }
        },
        confine: true,
      },
      xAxis: [
        {
          data: xAxisDataTop,
          axisLabel: {
            show: !isHideXAxisLabel
          },
          ...isHideXAxisLabel && {axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          }}
        },
        {
          data: xAxisDataBottom,
          axisLabel: {
            show: !isHideXAxisLabel
          }
        }
      ],
      yAxis: [
        {
          name: isHideXAxisLabel ? '' : yAxisObj.name,
          axisLabel: {
            formatter: (value) => {
              return yAxisObj.format == 'rmbYuan' ? `¥${formatData(value, 2)}` : (yAxisObj.format == 'percent' ? `${(Number(value)* 100).toFixed(0)} %` : formatData(value, 0));
            }
          },
          position: isHideXAxisLabel ? 'right': 'left',
          ...(isHideXAxisLabel && {splitNumber: 1})
        }
      ],
      series: [
        {
          name: isHideXAxisLabel ? '' : `${leftTime[0]} ~ ${leftTime[1]}`,
          data: seriesTop,
          areaStyle: {
            opacity: 1,
            color: '#E1F1FC'
          },
          lineStyle: {
            color: '#3796D7'
          }
        },
        {
          name: isHideXAxisLabel ? '' : `${rightTime[0]} ~ ${rightTime[1]}`,
          data: seriesBottom,
          lineStyle: {
            color: '#aaa'
          }
        }
      ],
      ...(isHideXAxisLabel && {
        grid: {
          left: '100', 
          right: '100', 
          top: '15px', 
          bottom: '15px', 
          containLabel: false
        },
        graphic: [
          {  
            type: 'text',
            top: 10,
            left: 20, 
            style: {
              text: yAxisObj.name
            }
          },
          {
            type: 'text',
            top: 25,
            left: 20, 
            style: {
              text: format(yAxisObj, compareData.basic),
            }
          },
          {
            type: 'text',
            top: 45,
            left: 20, 
            style: {
              text: (compareData.trend <= 0 ? '▼' : '▲' ) + format(yAxisObj, compareData.crease),
              fill: compareData.trend <= 0 ? 'green' : 'red'
            }
          },
          {
            type: 'text',
            top: 60,
            left: 20, 
            style: {
              text: `(${compareData.ratio})` ,
              fill: compareData.trend <= 0 ? 'green' : 'red'
            }
          },
        ]
      })
    });
    
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisDataTop, xAxisDataBottom, seriesTop, seriesBottom, yAxisObj, leftTime, rightTime, customeHeight, isHideXAxisLabel, compareData]); // 每当props改变的时候就会实时重新渲染
  return <div ref={chartRef} style={{width:'100%', height:'100%'}} className={styles['canvas-container']}></div>;
};

export default MultipleYAxis;

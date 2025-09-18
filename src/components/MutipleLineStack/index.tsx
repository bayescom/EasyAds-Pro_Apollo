import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { chartsResize } from '@/components/Utils';
import { formatData } from '@/services/utils/utils';
import styles from '../MultipleXAxis/index.module.less';

interface IProps {
  xAxisData: string [],
  shouldResize?: boolean,
  customHeight?: number,
  seriesData: seriesDataType [],
  yAxis: DimensionOption,
  // 是否显示X轴，默认显示
  isHideXAxisLabel?: boolean,
  total?: number | string,
}

const colors = [  
  '#FF00FF', // 红色  
  '#00FF00', // 绿色  
  '#9370DB', // 蓝色  
  '#FFFF00', // 黄色  
  '#00FFFF', // 青色（蓝绿色）  
  '#AA00DD', // 紫色（洋红）  
  '#800000', // 深红色  
  '#008000', // 深绿色  
  '#000080', // 深蓝色  
  '#FFA500'  // 橙色  
];

type seriesDataType = {
  name: string,
  data: [],
  type: string,
  smooth: boolean
}

type DimensionOption = {
  key: string,
  name: string,
  format?: string,
  color?: string,
};

const option = {
  color: colors,
  tooltip: {
    show: true,
    trigger: 'axis',
    confine: true,
  },
  grid: {
    left: '40px', 
    right: '40px', 
    top: '60px', 
    bottom: '60px', 
    containLabel: true
  },
  legend: {
    x: 'center',
    y: 'bottom'
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    min: 0, //就是这两个 最小值
    max: 'dataMax', //最大值
    scale: true,
    // scale:true,
  }
};

const MutipleLineStack: React.FC<IProps> = ({ shouldResize, xAxisData, seriesData, customHeight, yAxis, isHideXAxisLabel, total} : IProps) => {
  //拿到DOM容器
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    // 每一次都重新渲染，不然就会出现之前渲染的item的高度不是最新高度的情况
    chartRef.current.removeAttribute('_echarts_instance_');
    const chart = echarts.init(chartRef.current, {}, {
      renderer: 'canvas',
      useDirtyRect: false,
      height: customHeight ? customHeight : 500,
    }); 
    // 会出现数据累计的情况，使用clear每次都重新渲染
    chart.clear();

    chart.setOption(option);

    // 这个是为了解决切换tab的时候，图表的宽度初始化只有100px的问题
    setTimeout(() => {
      chart.resize();
      chartsResize(chart);
    }, 0);
    
  }, [shouldResize, customHeight, xAxisData, seriesData]);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    let existEchartsInstance = echarts.getInstanceByDom(chartRef.current);
    if (existEchartsInstance == null) {
      existEchartsInstance = echarts.init(chartRef.current, {}, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: customHeight ? customHeight : 500,
      });
    }

    const yAxisTotal =  yAxis.format == 'percent' ? total : (yAxis.format == 'rmbYuan' ? formatData(total, 2) : formatData(total, 0));

    existEchartsInstance?.setOption({
      tooltip: {
        trigger: 'axis',
        confine: true,
        position: 'top',
        formatter: (params) => {
          if (params) {
            let htmlStr = '';
            for (let i = 0; i < params.length; i++) {
              const param = params[i]; // 存一份item项
              const value = echarts.format.addCommas(param.value); //y轴值
              const color = param.color; //图例颜色
              htmlStr += '<div>';
              htmlStr +=
                '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                color +
                ';"></span>';
              //圆点后面显示的文本
              htmlStr += param.seriesName + '：' + (yAxis.format == 'percent' ? `${(Number(value) * 100).toFixed(2)} %` : value);
              htmlStr += '</div>';
            }
            htmlStr = `${params[0].name}<br/>` + htmlStr;
            return htmlStr;
          } else {
            return;
          }
        }
      },
      xAxis: {
        data: xAxisData,
        axisLabel: {
          show: !isHideXAxisLabel
        }
      },
      series: seriesData || [],
      yAxis: {
        name:  isHideXAxisLabel ? '' : yAxis.name,
        axisLabel: {
          formatter: (value) => {
            return yAxis.format == 'rmbYuan' ? `¥${formatData(value, 2)}` : (yAxis.format == 'percent' ? `${(Number(value)* 100).toFixed(0)} %` : formatData(value, 0));
          }
        },
        ...(isHideXAxisLabel && { splitNumber: 1 }),
        position: isHideXAxisLabel ? 'right': 'left',
      },
      ...(isHideXAxisLabel && {
        grid: {
          left: '100', 
          right: '100', 
          top: '15px', 
          bottom: '15px', 
          containLabel: false
        },
        legend: {show: false},
        graphic: [
          {  
            type: 'text',
            top: 10,
            left: 20, 
            style: {
              text: yAxis.name
            }
          },
          {  
            type: 'text',
            top: 25,
            left: 20, 
            style: {
              text: yAxisTotal
            }
          }
        ]
      })
    });
    // 将图表变为自适应
    chartsResize(existEchartsInstance);
  }, [xAxisData, seriesData, yAxis, isHideXAxisLabel, total, customHeight]); // 每当props改变的时候就会实时重新渲染
  return <div ref={chartRef} style={{width:'100%', height:'100%'}} className={styles['canvas-container']}></div>;
};

export default MutipleLineStack;

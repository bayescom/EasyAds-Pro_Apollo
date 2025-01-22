import store from '@/store';
import styles from '../index.module.less';
import { Spin } from 'antd';
import { useRef } from 'react';
import AreaBasicChart from '@/components/AreaBasicChart';
import { chartDimensionList } from '@/components/Utils/Constant';
import CustomeLineChartXAxis from './customeLineChartXAxis';

type IProps = {
  showCheckedKey: string[],
  loading: boolean,
}

function Index({
  showCheckedKey,
  loading
}: IProps) {
  const reportMedium  = store.useModelState('reportMedium');

  const listHeight = useRef <HTMLDivElement>(null);
 
  const customHeight = listHeight.current ? (showCheckedKey.length * 80 < listHeight.current.clientHeight ? listHeight.current.clientHeight / showCheckedKey.length : 80) : 80;

  return (
    <Spin spinning={loading}>
      <div className={styles['data-chart']} ref={listHeight} style={{marginBottom: '20px'}}>
        {
          showCheckedKey.length > 0 && reportMedium.mediumChartList.length > 0 && showCheckedKey.map(item => (<div key={item} className={styles['data-chart-item']}>
            {
              reportMedium.mediumChartSummaryData[item] && reportMedium.mediumChartList[0].timeList.length > 0 && chartDimensionList[item] && <>
                <AreaBasicChart 
                  xAxisData={reportMedium.mediumChartList[0].timeList} 
                  seriesData={reportMedium.mediumChartList[0][item]}
                  seriesColor={chartDimensionList[item].color}
                  yAxisObj={chartDimensionList[item]}
                  total={reportMedium.mediumChartSummaryData[item].basic}
                  customHeight={customHeight}
                />
                <div className={styles['left-dimension-line']} style={{height: customHeight}}></div>
                <div className={styles['right-dimension-line']}  style={{height: customHeight}}></div>
              </>
            }
          </div>))
        }
      </div>
      {
        showCheckedKey.length > 0 && reportMedium.mediumChartList.length > 0 && 
        <div className={styles['custome-line-chart-x']}><CustomeLineChartXAxis 
          xAxisData={reportMedium.mediumChartList[0].timeList}
        /></div>
      }
    </Spin>
  );
}

export default Index;

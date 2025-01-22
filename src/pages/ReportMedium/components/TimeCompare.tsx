import store from '@/store';
import styles from '../index.module.less';
import { Spin } from 'antd';
import { useRef } from 'react';
import { chartDimensionList } from '@/components/Utils/Constant';
import MultipleXAxis from '@/components/MultipleXAxis';
import moment from 'moment';
import CustomeMultipleXChartXAxis from './customeMultipleXChartXAxis';

type IProps = {
  showCheckedKey: string[],
  loading: boolean,
}

function Index({
  showCheckedKey,
  loading
}: IProps) {
  const reportMedium  = store.useModelState('reportMedium');

  const listHeight = useRef<HTMLDivElement>(null);
 
  const customHeight = listHeight.current ? (showCheckedKey.length * 80 < listHeight.current.clientHeight ? listHeight.current.clientHeight / showCheckedKey.length : 80) : 80;
  
  return (
    <Spin spinning={loading}>
      <div className={styles['data-chart']} ref={listHeight} style={{marginBottom: '40px'}}>
        {
          showCheckedKey.length > 0 && reportMedium.mediumChartList.length == 2 && showCheckedKey.map(item => (<div key={item} className={styles['data-chart-item']}>
            <MultipleXAxis
              xAxisDataTop={reportMedium.mediumChartList[0].timeList}
              xAxisDataBottom={reportMedium.mediumChartList[1].timeList}
              seriesTop={reportMedium.mediumChartList[0][item]}
              seriesBottom={reportMedium.mediumChartList[1][item]}
              yAxisObj={chartDimensionList[item]}
              leftTime={[moment.unix(reportMedium.queryParams.beginTime).format('YYYY-MM-DD'), moment.unix(reportMedium.queryParams.endTime).format('YYYY-MM-DD')]}
              rightTime={[moment.unix(reportMedium.queryParams.contrastBeginTime).format('YYYY-MM-DD'), moment.unix(reportMedium.queryParams.contrastEndTime).format('YYYY-MM-DD')]}
              shouldResize={reportMedium.activeKey == 'chart'}
              isHideXAxisLabel={true}
              customeHeight={customHeight}
              compareData={reportMedium.mediumChartSummaryData[item]}
            />
            <div className={styles['left-time-line']} style={{height: customHeight}}></div>
            <div className={styles['right-time-line']} style={{height: customHeight}}></div>
          </div>))
        }
      </div>
      {
        showCheckedKey.length > 0 && reportMedium.mediumChartList.length == 2 && <div className={styles['time-compare-container']}>
          <CustomeMultipleXChartXAxis 
            xAxisDataTop={reportMedium.mediumChartList[0].timeList}
            xAxisDataBottom={reportMedium.mediumChartList[1].timeList}
            shouldResize={reportMedium.activeKey == 'chart'}
            leftTime={[moment.unix(reportMedium.queryParams.beginTime).format('YYYY-MM-DD'), moment.unix(reportMedium.queryParams.endTime).format('YYYY-MM-DD')]}
            rightTime={[moment.unix(reportMedium.queryParams.contrastBeginTime).format('YYYY-MM-DD'), moment.unix(reportMedium.queryParams.contrastEndTime).format('YYYY-MM-DD')]}
          />
        </div>
      }
    </Spin>
  );
}

export default Index;

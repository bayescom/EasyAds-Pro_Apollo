import store from '@/store';
import styles from '../index.module.less';
import DataDimension from '@/components/DataDimension';
import { useEffect, useState } from 'react';
import ReportMediumTable from '@/components/ReportMediumTable';
import ReportTransmitButton from '@/components/ReportTransmitButton';
import DataTargetOperation from '@/components/DataTargetOperations';

const defaultPolyValueList = ['timestamp', 'mediaId'];
const defaultShowValueList = ['req', 'bid', 'bidRate', 'imp', 'impRate', 'click', 'income', 'ecpm'];

const reportMediumDispatcher = store.getModelDispatchers('reportMedium');

function Index() {
  const reportMedium  = store.useModelState('reportMedium');
  const dataTargetOperationState = store.useModelState('dataTargetOperation');

  // 报表添加SDK广告位ID
  const polyList = ['timestamp', 'mediaId', 'adspotId', 'channelId', 'sdkAdspotId'];

  const [loading, setLoading] = useState(false);
  const [polyCheckedKey, setPolyCheckedKey] = useState<string[]>(defaultPolyValueList);
  const [showCheckedKey, setShowCheckedKey] = useState<string[]>(defaultShowValueList);

  const checkedList: string[] = [...polyCheckedKey, ...showCheckedKey];

  useEffect(() => {
    if (reportMedium.activeKey == 'detail') {
      setLoading(true);
      reportMediumDispatcher.getMediumDetailData()
        .then(() => {
          setLoading(false);
        });
    }
  }, [reportMedium.tableParams, reportMedium.queryParams, reportMedium.isContrastTime, reportMedium.activeKey]);

  useEffect(() => {
    // 勾选了广告网络/广告源任意一个才显示竞胜数、竞胜率，不勾选不显示
    const showBidWin = ['channelId', 'sdkAdspotId'].some(item => polyCheckedKey.includes(item));
    let hideDatatarget: string[] = [];
    hideDatatarget = !showBidWin ? dataTargetOperationState.pageDataTarget.filter(item => !['bidWin', 'bidWinRate'].includes(item)) : dataTargetOperationState.pageDataTarget;
    setShowCheckedKey(hideDatatarget);
  }, [reportMedium.queryParams, polyCheckedKey, dataTargetOperationState.pageDataTarget]);

  const changeCheckedPolyValues = (value: string[]) => {
    reportMediumDispatcher.setTableParams({
      dimensions: value.join()
    });

    // 这个地方是将 value 按照 polyList 的顺序来输出，这样就保证了table在动态渲染的时候，每一列的顺序是固定不变的，
    setPolyCheckedKey([...value.sort((a,b) => polyList.indexOf(a) - polyList.indexOf(b))]);
  };

  return (
    <>
      <div className={styles['report-chart-filter']}>
        <DataDimension 
          checkedList={polyList}
          // isTimeStampDisabled={reportMedium.queryParams.type == 1}
          defaultValuesList={defaultPolyValueList}
          changeCheckedValues={changeCheckedPolyValues}
          labelName='展示维度'
        />
      </div>
      <div className={styles['resport-download-container']}>
        <DataTargetOperation className='data-target-container' type='reportMedium'/>
        <ReportTransmitButton
          showCheckedKey={showCheckedKey}
        />
      </div>
      <ReportMediumTable
        polyList={polyList}
        loading={loading}
        checkedList={checkedList}
        modelName='reportMedium'
      />
    </>
  );
}

export default Index;

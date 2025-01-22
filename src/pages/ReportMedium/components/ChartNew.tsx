import store from '@/store';
import styles from '../index.module.less';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import DataTargetOperation from '@/components/DataTargetOperations';
import DimensionCompare from './DimensionCompare';
import TimeCompare from './TimeCompare';

const { Option } = Select;

const defaultShowValueList = ['req', 'bid', 'bidRate', 'imp', 'impRate', 'click', 'income', 'ecpm'];

const reportMediumDispatcher = store.getModelDispatchers('reportMedium');

function Index() {
  const reportMedium  = store.useModelState('reportMedium');
  const dataTargetOperationState = store.useModelState('dataTargetOperation');
  const [form] = Form.useForm();

  /**
   * 对比方式  0 - 指标对比 1 - 时间对比 2 - 维度对比
   */
  const [currentCompareType, setCurrentCompareType] = useState(0);

  const [loading, setLoading] = useState(false);
  const localDataTargetDragTagList = window.localStorage.getItem('localDataTargetDragTagList');
  const defaultShowCheckedKey = localDataTargetDragTagList ? JSON.parse(localDataTargetDragTagList).map(item => item.value) : defaultShowValueList;
  const [showCheckedKey, setShowCheckedKey] = useState(defaultShowCheckedKey);
  

  // 这个是为了修复，更改了指标之后，需要刷新一下才能拿到最新指标列表的 bug.
  // bug 的原因是：之前 通过这种方式来赋值： setShowCheckedKey(dataTargetOperationState.pageDataTarget); 会导致在表单更改之后，不点击提交，在外面就立即【取消】 或者 【增加】了指标，因此想到可以从 localStorage 中取，就带来了 localStorage 更新了，但是没有实时赋值的 bug
  useEffect(() => {
    setShowCheckedKey(defaultShowCheckedKey);
  }, [dataTargetOperationState.pageDataTarget]);

  useEffect(() => {
    if (reportMedium.activeKey == 'chart' && currentCompareType != 2) {
      setLoading(true);
      reportMediumDispatcher.getMediumChartData()
        .then(() => {
          setLoading(false);
        });
    }
  }, [reportMedium.queryParams, currentCompareType, reportMedium.activeKey]);

  useEffect(() => {
    setShowCheckedKey(defaultShowCheckedKey);
  }, [reportMedium.queryParams]);

  useEffect(() => {
    if (reportMedium.isContrastTime) {
      // 上面筛选的时间对比勾选上之后，需要将图表的对比方式改为时间对比
      form.setFieldValue('compareType', 1);
      setCurrentCompareType(1);
      reportMediumDispatcher.setCurrentCompareValue(1);
    } else {
      // 当汇总方式更改之后，也会把 [是否时间对比]给取消,因此只需要判断，当是否进行时间对比切换为否的时候，都需要将图表的选择重置为 指标对比、0
      if (reportMedium.currentCompareType == 1 || currentCompareType == 1) {
        form.setFieldValue('compareType', 0);
        setCurrentCompareType(0);
        reportMediumDispatcher.setCurrentCompareValue(0);
      }
    }
  }, [reportMedium.isContrastTime, form, currentCompareType, reportMedium.currentCompareType]);

  // 0 - 指标对比、1 - 时间对比、2 - 纬度对比
  const changeCompareType = (value) => {
    reportMediumDispatcher.setCurrentCompareValue(value);
    setCurrentCompareType(value);
    // 如果是时间对比，则需要将上面的【时间对比】给勾选上
    if (value == 1) {
      reportMediumDispatcher.setIsContrastTime(true);
    } else {
      reportMediumDispatcher.setIsContrastTime(false);
    }
  };

  return (
    <>
      <div className={styles['report-header']}>
        <div className={styles['report-chart-dimension']}>
          <DataTargetOperation
            className='data-target-container' 
            type={'reportMedium'}
          />
          <Form 
            form={form}
            className={styles['inline-form']}
            style={{display: 'flex'}}
            initialValues={{
              compareType: 0
            }}
          >
            <Form.Item
              name="compareType"
              shouldUpdate
            >
              <Select onChange={changeCompareType} showArrow={true}>
                <Option value={0}>指标对比</Option>
                <Option value={1}>时间对比</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className={styles['report-chart-container']}>
        <div className={styles['report-chart-wrap']}>
          {
            reportMedium.currentCompareType == 0 && <DimensionCompare showCheckedKey={showCheckedKey} loading={loading} />
          }
          {
            reportMedium.currentCompareType == 1 && <TimeCompare showCheckedKey={showCheckedKey} loading={loading} />
          }
        </div>
      </div>
    </>
  );
}

export default Index;

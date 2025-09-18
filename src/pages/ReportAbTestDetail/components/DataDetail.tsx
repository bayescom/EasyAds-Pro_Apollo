import store from '@/store';
import styles from '../index.module.less';
import { useEffect, useState, useMemo } from 'react';
import ProCard from '@ant-design/pro-card';
import { config } from 'ice';
import DataTargetOperation from '@/components/DataTargetOperations';
import { IReportDetail, initColumnsList } from '@/components/Utils/TableColumnCostomization';
import { CloudDownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tooltip } from 'antd';
import { dataTargetArray } from '@/components/DataTargetOperations/utils';
import { ColumnsType } from 'antd/lib/table';
import { ProColumns } from '@ant-design/pro-table';
import { IReportReportAbTestDetailList } from '@/models/types/reportAbTest';
import { dataMapToFloat, dataDimension } from '../utils/index';

const defaultShowValueList = ['req', 'bid', 'imp', 'click', 'income', 'ecpm'];
const thirdKeys: string[] = [];
dataTargetArray[1].children.forEach(father => father.children.forEach(item => thirdKeys.push(item.value)));

const reportAbTestDetailDispatcher = store.getModelDispatchers('reportAbTestDetail');

function Index() {
  const tokenState = store.useModelState('token');
  const reportAbTestDetail = store.useModelState('reportAbTestDetail');
  const dataTargetOperationState = store.useModelState('dataTargetOperation');

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 这个是为了选中之后进行数据对比的
  const [showCheckedKey, setShowCheckedKey] = useState<string[]>(defaultShowValueList);
  const shouldShowSelection = reportAbTestDetail?.detailList?.length > 2;
  
  const checkedList: string[] = [...showCheckedKey];
  const checkedColumnList: ColumnsType<IReportDetail> | ProColumns<IReportDetail>= checkedList.map(item => initColumnsList[item]);

  useEffect(() => {
    if (reportAbTestDetail.queryParams.adspotId) {
      reportAbTestDetailDispatcher.getExperimentReportDetailById();
    }
  }, [reportAbTestDetail.queryParams]);

  useEffect(() => {
    if (reportAbTestDetail?.detailList?.length) {
      const firstTwoIds = reportAbTestDetail.detailList.slice(0, 2).map(item => item.groupId);
      setSelectedRowKeys(firstTwoIds);
    } else {
      setSelectedRowKeys([]);
    }
  }, [reportAbTestDetail?.detailList]);

  useEffect(() => {
    // 如果只有两个组的时候，默认进行对比
    const pageDataTarget = dataTargetOperationState.pageDataTarget;
    const currentPageDataTarget = pageDataTarget.filter(item => dataDimension.includes(item));
    if (selectedRowKeys.length) {
      if (selectedRowKeys.length == 2) {
        const baseData = reportAbTestDetail.detailList.find(item => item.groupId == Number(selectedRowKeys[0])) || [];
        const contrastData = reportAbTestDetail.detailList.find(item => item.groupId == Number(selectedRowKeys[1])) || [];
        const _contrastData: {[key in string] : string} = {};
        currentPageDataTarget.map(item => {
          // 因为要做运算，所以后端返回了字段的浮点数bidRatefloat，但是 dataTargetOperationState.pageDataTarget 存的是 bidRate，因此需要转一下
          const dataItem = dataMapToFloat[item];
          if (contrastData[dataItem] && baseData[dataItem]) {
            _contrastData[item] = (Number(((contrastData[dataItem] - baseData[dataItem]) / baseData[dataItem])) * 100).toFixed(2) + '%';
          } else if (!baseData[dataItem] && contrastData[dataItem]) {
            _contrastData[item] = '100%';
          } else {
            _contrastData[item] = '0';
          }
          
        });
        reportAbTestDetailDispatcher.setContrastData(_contrastData);
      } 

      if (selectedRowKeys.length == 1) {
        const _contrastData: {[key in string] : string} = {};
        currentPageDataTarget.map(item => {
          _contrastData[item] = '100' + '%';
        });
        reportAbTestDetailDispatcher.setContrastData(_contrastData);
      }
      
    } else {
      // 如果没人任何一行选中，那么对比数据就是0
      const _contrastData: {[key in string] : string} = {};
      currentPageDataTarget.map(item => {
        _contrastData[item] = '0';
      });
      reportAbTestDetailDispatcher.setContrastData(_contrastData);
    }
  }, [dataTargetOperationState.pageDataTarget, reportAbTestDetail.detailList, selectedRowKeys]);

  const columns = [
    {
      title: '分组',
      fixed: 'left',
      dataIndex: 'tag',
      render: (_dom, detail) => (
        <Space className={styles['channel-name-container']} size={0}>
          {detail.tag}({detail.percentageString})
        </Space>
      ),
      width: 140
    }
  ];

  const baseParams = {hideInSearch: true, showSorterTooltip: false, sorter: true};

  let childAllColumns = columns.concat(checkedColumnList.map((item, index) => ({ ...item, ...baseParams, sorter: false})));

  // 只有两列的时候，不需要展示多选的列
  const tableColumns = useMemo(() => {
    if (!shouldShowSelection) {
      // 当不需要选择列时，直接返回原始列配置
      return childAllColumns;
    }
    // 需要选择列时，保持原有逻辑
    return childAllColumns;
  }, [childAllColumns, shouldShowSelection]);

  useEffect(() => {
    const currentPageDataTarget = dataTargetOperationState.pageDataTarget.filter(item => dataDimension.includes(item));
    setShowCheckedKey(currentPageDataTarget);
  }, [dataTargetOperationState.pageDataTarget]);

  const download = () => {
    const adspotId = reportAbTestDetail.currentExperiment.adspotId;
    const expId = reportAbTestDetail.currentExperiment.id;
    const expType = reportAbTestDetail.currentExperiment.experimentType;
    const beginTime = reportAbTestDetail.queryParams.beginTime;
    const endTime = reportAbTestDetail.queryParams.endTime;
    const isThird = reportAbTestDetail.queryParams.isThird;

    window.open(`${config.luna}/sdk_experiment/download?adspotId=${adspotId}&expId=${expId}&expType=${expType}&beginTime=${beginTime}&endTime=${endTime}&isThird=${isThird}&display=${showCheckedKey}&expName=${reportAbTestDetail.currentExperiment.experimentName}`, '_blank');
  };

  const rowSelection = reportAbTestDetail?.detailList?.length > 2 ? {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      // 确保最多只能选择两项
      if (selectedKeys.length <= 2) {
        setSelectedRowKeys(selectedKeys);
      }
    },
    preserveSelectedRowKeys: true,
    getCheckboxProps: (record: IReportReportAbTestDetailList) => {
      return {
        disabled: record.status === 0 || selectedRowKeys.length >= 2 && !selectedRowKeys.includes(record.groupId), 
        name: record.tag,
      };
    },
  } : undefined;

  return (
    <ProCard className={styles['data-detail-container']}>
      <div className={styles['resport-download-container']}>
        <h3 className={styles['common-title']}>A/B测试数据概览</h3>
        <div className={styles['resport-download-wrap']}>
          <Button
            key="download"
            onClick={download}
            className={styles['download-button']}
          >
            <Space style={{color: '#403f3f'}}>
              <CloudDownloadOutlined />下载报表
            </Space>
          </Button>
          <DataTargetOperation
            className='data-target-container'
            type='reportAb'
          />
        </div>
        
        
      </div>
      <Table
        columns={tableColumns}
        rowSelection={rowSelection}
        dataSource={reportAbTestDetail.detailList}
        pagination={false}
        scroll={{ x: 1300 }}
        rowKey='groupId'
        className={styles['api-channel-row-table-wrap']}
        showSorterTooltip={false}
        summary={() => 
          <Table.Summary fixed='bottom'>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={shouldShowSelection ? 2 : 1}>
                <>对比结果<Tooltip title="仅支持两个测试分组进行数据对比，且按照默认计算方式计算对比数据。计算方式=（测试分组排列靠后的分组-测试分组排列靠前的分组）/测试分组排列靠前的分组*100%"><QuestionCircleOutlined /></Tooltip></>
              </Table.Summary.Cell>
              {checkedList.map((item, index) => (
                <Table.Summary.Cell index={index + 2} key={item}>
                  {reportAbTestDetail.contrastData[item]}
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          </Table.Summary>
        }
      />
    </ProCard>
  );
}

export default Index;

import store from '@/store';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IReportDetail,  initColumnsList } from '@/components/Utils/TableColumnByCompare';
import styles from './index.module.less';
import SummaryCell from './summaryCell';
import { useEffect, useState } from 'react';

interface IProps {
  loading: boolean,
  polyList: string [],
  checkedList: string [],
  noHasPagination?: boolean,
  modelName: 'reportMedium'
}

const ReportTableCustomization: React.FC<IProps> = ({ loading, checkedList, polyList, noHasPagination, modelName } : IProps) => {
  const checkedColumnList: ColumnsType<IReportDetail>= checkedList.map(item => initColumnsList[item]);
  const [state, stateDispatcher] = store.useModel(modelName);
  // 当没有勾选展示维度时，隐藏总计，显示index=0的小计数据
  const [hideDimensions, setHideDimensions] = useState(false);

  useEffect(() => {
    const hasPolyListValue = polyList.filter(item => checkedList.includes(item));
    hasPolyListValue.length ? setHideDimensions(false) : setHideDimensions(true);
  }, [polyList, checkedList]);

  const onChange = (pagination, filters, sorter) => {
    const pageChange = state.tableParams.page !== pagination.current;
    if (pageChange) {
      stateDispatcher.setTablePage({ page: pagination.current });
    } else {
      stateDispatcher.setTableParams({ 
        page: pagination.current, 
        limit: pagination.pageSize, 
        sort: sorter.columnKey || 'timestamp', 
        dir: sorter.order == 'ascend' ? 'asc' : 'desc' 
      });
    }
  };

  return (
    <>
      <Table
        sticky
        dataSource={state.detailList}
        columns={checkedColumnList}
        sortDirections={['descend', 'ascend', 'descend']}
        rowKey='id'
        pagination={noHasPagination ? false : {
          current: state.tableParams.page,
          pageSize: state.tableParams.limit,
          total: state.total,
          size: 'small', 
          showTotal: (total, range) => `第 ${range[0]} - ${range[1]} 条/总共 ${total} 条`,
          showSizeChanger: state.total > 10,
        }}
        summary={() => 
          <Table.Summary fixed='top'>
            <Table.Summary.Row>
              {
                checkedList.map((item, index) => (
                  <Table.Summary.Cell index={index} key={item}>
                    {
                      index ? 
                        (polyList.includes(item) ? ('') : (
                          <SummaryCell item={item} index={index} modelName={modelName} />
                        ))
                        : hideDimensions ? <SummaryCell item={checkedList[0]} index={0} modelName={modelName} /> : ('总计')
                    }
                  </Table.Summary.Cell>
                ))
              }
            </Table.Summary.Row>
          </Table.Summary>
        }
        scroll={{x: 1400}}
        loading={loading}
        onChange={onChange}
        className={[styles['report-table'], state.isContrastTime ? styles['report-table-compare'] : ''].join(' ')}
        showSorterTooltip={false}
      />
    </>
  );
};

export default ReportTableCustomization;

import { Space, Typography, Image, Tooltip } from 'antd';
import store from '@/store';
import styles from './index.module.less';
import { IReportReportAbTest, IReportReportAbTestQueryPayload, ReportReportAbTestFilter } from '@/models/types/reportAbTest';
import { PageParams } from '@/models/types/common';
import { ProFormInstance } from '@ant-design/pro-form';
import { ActionType, ProColumns, ProTableProps } from '@ant-design/pro-table';
import moment from 'moment';
import { useEffect, useRef,Fragment } from 'react';
import ListPage from '@/components/Utils/ListPage';
import CopyableText from '@/components/CopyableText';
import MultipleSelect from '@/components/MultipleSelect';
import { Link } from 'ice';
import { getPageParams } from '@/services/utils/queryParamsFormatter';
import { getTimeDifference } from '@/services/utils/utils';

type TableFilter = Partial<ReportReportAbTestFilter> & {
  timeRange: [number, number],
};
type TableRequestParams = Parameters<NonNullable<ProTableProps<IReportReportAbTest, TableFilter>['request']>>;
type QueryParams = TableRequestParams[0] & Required<Pick<TableRequestParams[0], 'pageSize' | 'current'>> & TableFilter;

const { Text } = Typography;

const formatParams = (
  params: QueryParams
): ReportReportAbTestFilter & PageParams => {
  const page = getPageParams(params);

  return {
    mediaIds: params.mediaIds || undefined,
    adspotIds: params.adspotIds || undefined,
    expIds: params.expIds || undefined,
    expType: params.expType || undefined,
    status: params.status || undefined,
    ...page,
  };
};

const reportAbTestDispatcher = store.getModelDispatchers('reportAbTest');

function ReportAbTest() {
  const reportAbTest = store.useModelState('reportAbTest');

  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    reportAbTestDispatcher.getFilterExperimentList();
    reportAbTestDispatcher.getMediaList({});
    queryAdspotList();
  }, []);

  const queryAdspotList = async () => {
    if (!formRef.current) {
      return;
    }

    const mediaIds = formRef.current.getFieldsValue().mediaIds;
    const mediaParam = mediaIds !== undefined && mediaIds.length ? {mediaIds: mediaIds.toString()} : {} ;
    await reportAbTestDispatcher.getAdspotList({ ...mediaParam });
  };

  const columns: ProColumns<IReportReportAbTest>[] = [
    {
      dataIndex: 'expIds',
      hideInTable: true,
      formItemProps: {
        className: styles['media-select-wrap'],
      },
      renderFormItem: () => (<MultipleSelect 
        formRef={formRef}
        options={reportAbTest.filterExpList}
        label='测试名称'
        name='expIds'
        keyType='value'
        isNoShowIdOrValue={true}
        onChange={(value) => {
          formRef.current?.submit();
        }}
        changeFormValue={() => {
          formRef.current?.submit();
        }}
        onChangeCurrentSelect={() => {
          formRef.current?.submit();
        }}
      />),
      order: 8
    },
    {
      title: '测试类型',
      dataIndex: 'expType',
      valueType: 'select',
      hideInTable: true,
      initialValue: '-1',
      search: {
        transform: value => value === '-1' ? {} : { expType: value }
      },
      fieldProps: {
        onChange: () => formRef.current?.submit(),
        options: [
          { value: '-1', label: '全部' },
          { value: '2', label: '瀑布流A/B测试' },
          { value: '1', label: '流量分组A/B测试' }
        ]
      },
      order: 7
    },
    {
      title: '测试状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      initialValue: '-1',
      search: {
        transform: value => value === '-1' ? {} : { status: value }
      },
      fieldProps: {
        onChange: (value) => {
          formRef.current?.submit();
        },
        options: [
          { value: '-1', label: '全部' },
          { value: '1', label: '测试中' },
          { value: '0', label: '已结束' },
          { value: '2', label: '已暂停' }
        ]
      },
    },
    {
      dataIndex: 'mediaIds',
      hideInTable: true,
      formItemProps: {
        className: styles['media-select-wrap'],
      },
      renderFormItem: () => (<MultipleSelect 
        formRef={formRef}
        options={reportAbTest.mediaList}
        label='媒体'
        name='mediaIds'
        keyType='value'
        isMedia={true}
        urlKey='url'
        hasPlatform={true}
        platformKey='platform'
        onChange={(value) => {
          formRef.current?.setFieldValue('mediaIds', value);
          queryAdspotList();
        }}
        changeFormValue={() => {
          formRef.current?.submit();
          queryAdspotList();
        }}
        onChangeCurrentSelect={() => {
          formRef.current?.submit();
          queryAdspotList();
        }}
      />),
    },
    {
      dataIndex: 'adspotIds',
      hideInTable: true,
      formItemProps: {
        className: styles['media-select-wrap'],
      },
      renderFormItem: () => (<MultipleSelect 
        formRef={formRef}
        options={reportAbTest.adspotList}
        label='广告位'
        name='adspotIds'
        isRight={false}
        keyType='value'
        onChange={(value) => {
          formRef.current?.submit();
        }}
        changeFormValue={() => {
          formRef.current?.submit();
        }}
        onChangeCurrentSelect={() => {
          formRef.current?.submit();
        }}
      />),
    },
    {
      title: '媒体',
      dataIndex: 'mediaName',
      search: false,
      render: (dom, reportAbTest) => (
        <Space size={0} style={{width:'100%', display: 'flex'}} className={styles['chineseName-container']}>
          <Image src={reportAbTest.mediaIcon} preview={false} style={{width: '36px', height: 'auto', marginRight: '5px'}}/>
          <Space direction="vertical" size={0}>
            <Tooltip title={reportAbTest.mediaName.length > 11 ? reportAbTest.mediaName : false} placement='topLeft'>{reportAbTest.mediaName}</Tooltip>
            {/* </Link> */}
            <Text type="secondary">
              <CopyableText text={`${reportAbTest.mediaId}`} nameInTooltip='媒体ID'>
                {reportAbTest.mediaId}
              </CopyableText>
            </Text>
          </Space>
        </Space>
      ),
      width: '18%'
    },
    {
      title: '广告位',
      dataIndex: 'adspotName',
      search: false,
      width: '15%',
      render: (dom, reportAbTest) => (
        <Space direction="vertical" size={0} style={{marginRight: '35px'}}>
          <Text>
            <Typography.Paragraph
              style={{marginBottom: '0px', wordBreak: 'break-all'}}
              ellipsis={{ rows: 2 }}
            >
              <Tooltip title={reportAbTest.adspotName}>{reportAbTest.adspotName}</Tooltip>
            </Typography.Paragraph>
          </Text>
          <CopyableText
            text={`${reportAbTest.adspotId}`}
            nameInTooltip="id"
          >
            <Text type="secondary">{reportAbTest.adspotId}</Text>
          </CopyableText>      
        </Space>
      ),
    },
    {
      title: '测试名称',
      dataIndex: 'experimentName',
      search: false,
      order: 8,
      width: '15%'
    }, 
    {
      title: '测试类型',
      dataIndex: 'experimentType',
      search: false,
      order: 8,
      width: 120,
      render: (dom, adspot) => (<>
        {
          Number(adspot.experimentType) == 1 ? '流量分组A/B测试' : '瀑布流A/B测试'
        }
      </>)
    }, 
    {
      title: '测试详情',
      dataIndex: 'createdAt',
      search: false,
      order: 8,
      width: 200,
      render: (dom, reportAbTest) => (<>
        <p>生效时间：{reportAbTest.createdAt}</p>
        <p>测试时长： {reportAbTest.status ? getTimeDifference(reportAbTest.createdAt, moment().format('YYYY-MM-DD HH:mm:ss')) : getTimeDifference(reportAbTest.createdAt, reportAbTest.endAt)}</p>
      </>)
    },
    {
      title: '测试状态',
      dataIndex: 'status',
      search: false,
      order: 8,
      width: 80,
      render: (dom, reportAbTest) => (<>
        {
          reportAbTest.status == 1 ? '测试中' : !reportAbTest.status ? '已结束' : '已暂停'
        }
      </>)
    },
    {
      title: '操作',
      valueType: 'option',
      width: 70,
      render: (dom, reportAbTest, index, actions) => (<Space size={[8, 0]} wrap={false}>
        <Link to={`/data_report/ab_report_detail/${reportAbTest.id}`}>查看数据</Link>
      </Space>)
    }
  ];

  return (
    <Fragment>
      <ListPage<IReportReportAbTest, ReportReportAbTestFilter>
        columns={columns}
        columnEmptyText='-'
        request={async (params: QueryParams, sort) => {
          return {
            ...await reportAbTestDispatcher.getList({ params: formatParams(params), sort } as IReportReportAbTestQueryPayload), 
            success: true
          };
        }}
        dataSource={reportAbTest.detailList}
        className={styles['ab-test-table-container']}
        sortDirections={['descend', 'ascend', 'descend']}
        size="small"
        sticky={{ offsetHeader: 52 }}
        formRef={formRef}
        rowKey={'id'}
        actionRef={actionRef}
        form={{
          syncToUrl: true
        }}
      />
    </Fragment>
  );
}

export default ReportAbTest;

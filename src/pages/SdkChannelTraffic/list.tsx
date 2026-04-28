import ListPage from '@/components/Utils/ListPage';
import store from '@/store';
import { VerticalAlignTopOutlined } from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-form';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { BasicOption, DateType, PageParams, SortParams } from '@/models/types/common';
import { getPageParams, getSortParams } from '@/services/utils/queryParamsFormatter';
import { Space, Tag, Image, Typography, Divider, Tooltip, Breadcrumb, Form, BackTop } from 'antd';
import { useMemo, useRef, useState, Fragment, useEffect } from 'react';
import debounce from 'lodash/debounce';
import styles from './index.module.less';
import { Link, useParams, useHistory } from 'ice';
import mediumService from '@/services/medium';
import { IMedium } from '@/models/types/medium';
import { SdkChannelTrafficListFilter, ISdkChannelTrafficList } from '@/models/types/sdkChannelTrafficList';
import ProCard from '@ant-design/pro-card';
import CopyableText from '@/components/CopyableText';
import moment from 'moment';
import { pageDataTarget } from '@/models/dataTargetOperation';
import { ColumnsType } from 'antd/es/table';
import { IReportDetail, initColumnsList } from '@/components/Utils/TableColumnCostomization';
import DateRange from '@/components/DateRange';
import DataTargetForm from '@/components/SdkDistribution/modals/DataTargetForm';
import Setting from '@/components/SdkDistribution/modals/Setting';
import MultipleSelect from '@/components/MultipleSelect';
import useSimplePaginationCorrector from '@/hooks/useSimplePaginationCorrector';
import SdkChannelOperation from './components/Operations';
import SdkChannelName from './components/Name';

const formatParams = (
  params,
  sort,
  time
): SdkChannelTrafficListFilter & PageParams & SortParams => {
  const page = getPageParams(params);

  return {
    ...time,
    status: params.status,
    mediaIds: params.mediaIds,
    adspotTypes: params.adspotTypes,
    searchText: params.searchText,
    ...page,
    ...getSortParams(sort)
  };
};

type MediumFilterOption = {
  id: number,
  name: string,
  platform: number,
  mediaIconUrl: string
};

const { Text } = Typography;
const { Item } = Breadcrumb;

const defaultTime = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix()
};

const sdkChannelTrafficListDispatcher = store.getModelDispatchers('sdkChannelTrafficList');
const sdkChannelDispatcher = store.getModelDispatchers('sdkChannel');
const distributionDispatcher = store.getModelDispatchers('distribution');

function Index() {
  const { id } = useParams<{ id: string }>();

  const history = useHistory();

  const sdkChannelTrafficListState = store.useModelState('sdkChannelTrafficList');
  const distributionState = store.useModelState('distribution');
  const channelState = store.useModelState('channel');
  const [codeState, codeDispatcher] = store.useModel('code');

  const [prePagination, setPrePagination] = useState({page: 1, pageSize: 20});
  const [time, setTime] = useState<DateType>(() => {
    const localDateType = window.sessionStorage.getItem('commonDateType');
    return localDateType ? JSON.parse(localDateType) : defaultTime;
  });
  const [showCheckedKey, setShowCheckedKey] = useState<string[]>(pageDataTarget);
  const checkedList: string[] = [...showCheckedKey];
  const checkedColumnList: ColumnsType<IReportDetail>= checkedList.map(item => initColumnsList[item]);

  const [adspotTypeList, setAdspotTypeList] = useState<BasicOption<string>[]>([]);

  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const wrapRequest = useSimplePaginationCorrector(sdkChannelTrafficListState.total, actionRef);

  // 操作记录的弹窗
  const [loading, setLoading] = useState(false);

  const [mediumList, setMediumList] = useState<MediumFilterOption[]>([]);
  useState(async () => {
    const data = await mediumService.getList({});   

    const newMediumList = data.medium.map((item: IMedium) => ({
      id: item.id,
      name: item.mediaName,
      platform: item.platformType
    }));
    setMediumList(newMediumList);
  });

  useEffect(() => {
    sdkChannelDispatcher.queryAll({});
  }, []); 

  useEffect(() => {
    if (codeState.layout) {
      const adspotTypes = codeState.layout.map(item => {return {name: item.name, value: item.value as string};});
      setAdspotTypeList(adspotTypes);
    } else {
      codeDispatcher.fetchCodeList(['layout', true]);
    }
  }, [codeState.layout]);


  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 500),
    []
  );

  useEffect(() => {
    const localDateType = window.sessionStorage.getItem('commonDateType');
    if (localDateType) {
      const dateType = JSON.parse(localDateType);
      form.setFieldValue('time', [moment(dateType.beginTime * 1000), moment(dateType.endTime * 1000)]);
    } else {
      form.setFieldValue('time', [moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day')]);
    }
  }, []);

  useEffect(() => {
    const newShowCheckedKey = distributionState.distributionDataTarget;
    setShowCheckedKey(newShowCheckedKey);
  }, [distributionState.distributionDataTarget]);

  const columns: ProColumns<ISdkChannelTrafficList>[] = [
    {
      title: '搜索',
      dataIndex: 'searchText',
      key: 'searchText',
      hideInTable: true,
      search: {
        transform: value => ({ searchText: value.trim() || undefined })
      },
      fieldProps: {
        onChange: submitFilterQuery,
      },
      order: 11
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 40,
      align: 'center',
      valueType: 'select',
      search: {
        transform: value => value === -1 ? {} : { status: value }
      },
      initialValue: 1,
      fixed: 'left',
      fieldProps: {
        onChange: () => formRef.current?.submit(),
        options: [
          { value: -1, label: '全部' },
          { value: 1, label: '使用中' },
          { value: 0, label: '未使用' }
        ]
      },
      hideInTable: true,
      render: (_dom, channel) => (<>
        <Tag color={channel.status ? 'success' : 'default'}>{channel.status ? '使用中' : '未使用'}</Tag>
      </>),
    },
    {
      // title: '媒体',
      dataIndex: 'mediaIds',
      hideInTable: true,
      formItemProps: { style: {border: 'none'} },
      renderFormItem: () => (<MultipleSelect 
        formRef={formRef}
        options={mediumList}
        label='媒体'
        name='mediaIds'
        keyType='id'
        isMedia={true}
        urlKey='url'
        hasPlatform={true}
        platformKey='platform'
        onChange={(value) => {
          sdkChannelTrafficListDispatcher.setMediaIds(formRef.current?.getFieldValue('mediaIds'));
          formRef.current?.setFieldValue('mediaIds', value);
          formRef.current?.submit();
        }}
        changeFormValue={() => {
          sdkChannelTrafficListDispatcher.setMediaIds(formRef.current?.getFieldValue('mediaIds'));
          formRef.current?.submit();
        }}
        onChangeCurrentSelect={() => {
          sdkChannelTrafficListDispatcher.setMediaIds(formRef.current?.getFieldValue('mediaIds'));
          formRef.current?.submit();
        }}
      />),
    },
    {
      dataIndex: 'adspotTypes',
      hideInTable: true,
      formItemProps: { style: {border: 'none'} },
      renderFormItem: () => (<MultipleSelect 
        options={adspotTypeList}
        label='广告位类型'
        name='adspotTypes'
        keyType='value'
        changeFormValue={() => {
          formRef.current?.submit();
        }}
        onChangeCurrentSelect={() => {
          formRef.current?.submit();
        }}
        isRight={true}
        isNoShowIdOrValue={true}
        notShowSearchInput={true}
      />),
    },
    {
      title: '广告源',
      dataIndex: 'sdkChannelName',
      search: false,
      width: 140,
      fixed: 'left',
      className: 'channel-name-container',
      render: (_dom, sdkChannelTrafficList) => (
        <Space size={0}>
          <Tooltip title={sdkChannelTrafficList.status ? '分发中': '未参与分发'} placement='topLeft'>
            <div style={{backgroundColor: sdkChannelTrafficList.status ? '#199b00' : '#e52848'}} className={styles['execute-status']}></div>
          </Tooltip>
          <SdkChannelName model={sdkChannelTrafficList} />
        </Space>)
    },
    {
      title: '价格(CPM)',
      dataIndex: 'price',
      search: false,
      width: 80,
      fixed: 'left',
      render: (_dom, sdkChannelTrafficList) => (<>
        <Text>￥{sdkChannelTrafficList.price || '-'}</Text>
      </>)
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      fixed: 'left',
      render: (dom, sdkChannelTrafficList, index, actions) => (<Space size={[5, 0]} wrap>
        <SdkChannelOperation
          model={sdkChannelTrafficList} 
          adspotId={sdkChannelTrafficList.adspotId} 
          mediaId={sdkChannelTrafficList.mediaId} 
          
          changeStatus={async (status ) => {
            setLoading(true);
            const result = await sdkChannelTrafficListDispatcher.updateStatus({ channelTraffic: sdkChannelTrafficList, status });
            setLoading(false);
            if (result) {
              formRef.current?.submit();
            }
            
          }}
          setLoading={(value) => setLoading(value)}
          onEditSubmit={() => formRef.current?.submit()}
        />
      </Space>)
    },
    {
      title: '广告位/id',
      dataIndex: 'adspotName',
      search: false,
      width: 160,
      fixed: 'left',
      render: (_dom, sdkChannelTrafficList) => (
        <Space direction="vertical" size={0}>
          <Text>{sdkChannelTrafficList.adspotName}</Text>
          <div>
            <CopyableText
              text={sdkChannelTrafficList.adspotId}
              nameInTooltip='广告位ID'
            >
              <Text type="secondary">{sdkChannelTrafficList.adspotId}｜</Text>
            </CopyableText>
            <a onClick={() => {
              const { sdk_group_percentage_id, sdk_group_targeting_id,sdk_group_targeting_percentage_id } = sdkChannelTrafficList.sdkGroup;
              distributionDispatcher.setCurrentPercentageId(sdk_group_percentage_id);
              distributionDispatcher.setGroupTargetId(sdk_group_targeting_id);
              distributionDispatcher.setCurrentTargetPercentageStrategyTrafficId(sdk_group_targeting_percentage_id);
              distributionDispatcher.setAdspotId(sdkChannelTrafficList.adspotId);
              history.push(`/traffic/distribution?mediaId=${sdkChannelTrafficList.mediaId}&adspotId=${sdkChannelTrafficList.adspotId}`);
            }}>查看</a>
          </div>
        </Space>
      )
    },
    {
      title: '所属媒体/id',
      dataIndex: 'mediaName',
      search: false,
      width: 160,
      fixed: 'left',
      render: (dom, sdkChannelTrafficList) => (
        <Space size={0} style={{width:'100%', display: 'flex'}} className={styles['chineseName-container']}>
          <Image src={sdkChannelTrafficList.mediaIcon} preview={false} style={{width: '36px', height: 'auto', marginRight: '5px'}}/>
          <Space direction="vertical" size={0}>
            <Tooltip title={sdkChannelTrafficList.mediaName.length > 10 ? sdkChannelTrafficList.mediaName : false} placement='topLeft'>
              {sdkChannelTrafficList.mediaName}
            </Tooltip>
            <div>
              <CopyableText
                text={sdkChannelTrafficList.mediaId}
                nameInTooltip='媒体ID'
              >
                <Text type="secondary">{sdkChannelTrafficList.mediaId}｜</Text>
              </CopyableText>
              <Link to={`/traffic/list/media/${(sdkChannelTrafficList.mediaId)}/edit`}>查看</Link>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: '所属分组名称',
      dataIndex: 'group_tag',
      search: false,
      width: 160,
      fixed: 'left',
      render: (_dom, sdkChannelTrafficList) => (<>
        <Text>{sdkChannelTrafficList.sdkGroup.group_tag || '-'}</Text>
      </>)
    }
  ];

  

  const handleChangePagination = (page, pageSize) => {
    if (page !== prePagination.page || pageSize !== prePagination.pageSize) {
      setPrePagination({page, pageSize});
    }
  };

  const  supplementaryData = [
    {
      title: '定向',
      dataIndex: 'directionList',
      search: false,
      width: 140,
      render: (_dom, sdkChannelTrafficList) => (<div style={{whiteSpace: 'break-spaces', width: '135px'}}>
        {
          sdkChannelTrafficList.directionList.length ? (
            sdkChannelTrafficList.directionList.map((item, index) => (<Fragment key={item.name + '_' + index}>
              {
                index
                  ? <Divider
                    type="vertical"
                    style={{ border: '1px solid #ccc' }}
                  />
                  : ''
              }
              <Tooltip title={item.property + ':' + item.value}>
                <Text className={styles['ad-info']}>{item.name}</Text>
              </Tooltip>
            </Fragment>))
          ): (<>-</>)
        }
      </div>)
    },
    {
      title: '频次控制',
      dataIndex: 'limitList',
      search: false,
      width: 140,
      render: (_dom, sdkChannelTrafficList) => (<div style={{whiteSpace: 'break-spaces', width: '135px'}}>
        {
          sdkChannelTrafficList.limitList.length ? (
            sdkChannelTrafficList.limitList.map((item, index) => (<Fragment key={item.name + '_' + index}>
              {
                index
                  ? <Divider
                    type="vertical"
                    style={{ border: '1px solid #ccc' }}
                  />
                  : ''
              }
              <Tooltip title={item.value}>
                <Text className={styles['ad-info']}>{item.name}</Text>
              </Tooltip>
            </Fragment>))
          ): (<>-</>)
        }
      </div>)
    }
  ];

  const baseParams = {hideInSearch: true, showSorterTooltip: false, sorter: true};
  const _columns = columns.concat(checkedColumnList.map((item, index) => (index == 0 ? { ...item, ...baseParams, className: 'adv-border-left', width: (item.width + 20)} : { ...item, ...baseParams}))).concat(supplementaryData);

  return (
    <>
      <ProCard ghost style={{marginBottom: '9px'}}>
        <Breadcrumb>
          <Item onClick={() => history.goBack()} className={styles['cursor']}>返回</Item>
          <Item>广告源管理</Item>
          <Item>{channelState.list.find(item => item.adnId == Number(id))?.adnName}</Item>
        </Breadcrumb>
      </ProCard>
      <ListPage<ISdkChannelTrafficList, SdkChannelTrafficListFilter>
        columns={_columns}
        request={wrapRequest(async (params, sort) => ({
          ...await sdkChannelTrafficListDispatcher.getList({ params: formatParams(params, sort, time), sdkChannelId: +id}), 
          success: true
        }))}
        className={styles['channel-traffic-table']}
        dataSource={sdkChannelTrafficListState.list}
        formRef={formRef}
        actionRef={actionRef}
        scroll={{ x: 1300 }}
        sticky={{ offsetHeader: 52 }}
        rowKey={record => record.id + '_' + record.sdkGroup.sdk_group_targeting_id + '_' + record.sdkGroup.sdk_group_id + '_' + record.sdkGroup.sdk_group_percentage_id + record.sdkGroup.sdk_group_targeting_percentage_id}
        // rowSelection={rowSelection}
        tableAlertRender={false}
        pagination={{onChange: (page, pageSize) => handleChangePagination(page, pageSize)}}
        toolBarRender={() => [
          <Space className={styles['channel-list-time']} size={0} key='channel-setting'>
            <Setting />
            <Form
              form={form}
              onValuesChange={() => {
                const { time } = form.getFieldsValue();
                const dateType = {
                  beginTime: time[0].unix(),
                  endTime: time[1].unix()
                };
                setTime(dateType);
                const commonDateType = dateType;
                window.sessionStorage.setItem('commonDateType', JSON.stringify(commonDateType));
                formRef.current?.submit();
              }}
            >
              <Form.Item
                name="time"
                getValueFromEvent={value => ([value[0].startOf('day'), value[1].endOf('day')])}
              >
                <DateRange 
                  canSelectRangeDay={30}
                  hideLastHour={ true }
                  canSelectToday={ true }
                />
              </Form.Item>
            </Form>
          </Space>
        ]}
      />

      <DataTargetForm />

      <BackTop className={styles['circle-back-top']}>
        <VerticalAlignTopOutlined style={{color: '#2364FB'}}/>
      </BackTop>
    </>
  );
}

export default Index;

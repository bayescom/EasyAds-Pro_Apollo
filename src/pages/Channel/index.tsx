import ListPage from '@/components/Utils/ListPage';
import ChannelSdkModalForm from './sdkForm';
import { ChannelFilter, ISdkChannel } from '@/models/types/channel';
import type { ColumnsType } from 'antd/es/table';
import store from '@/store';
import { SearchOutlined } from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-form';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { DateType, PageParams, SortParams } from '@/models/types/common';
import { getPageParams, getSortParams } from '@/services/utils/queryParamsFormatter';
import { Space, Tag, Image, Form } from 'antd';
import { useMemo, useRef, useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import styles from './index.module.less';
import DefaultIcon from '@/assets/icons/channel/defaultIcon.png';
import DataTargetOperation from '@/components/DataTargetOperations';
import { IReportDetail, initColumnsList } from '@/components/Utils/TableColumnCostomization';
import DateRange from '@/components/DateRange';
import moment from 'moment';
import { channelIconMap } from '@/components/Utils/Constant';

const formatParams = (
  params,
  sort,
  time
): ChannelFilter & PageParams & SortParams => {
  const page = getPageParams(params);

  return {
    ...time,
    status: params.status,
    searchText: params.searchText,
    ...page,
    ...getSortParams(sort)
  };
};

const defaultTime = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix()
};

const channelDispatcher = store.getModelDispatchers('channel');
const defaultShowValueList = ['req', 'bid', 'bidRate', 'imp', 'impRate', 'click', 'clickRate', 'income', 'ecpm'];

function Channel() {
  const channelState = store.useModelState('channel');
  const dataTargetOperationState = store.useModelState('dataTargetOperation');
  const [sdkModalData, setSdkModalData] = useState<ISdkChannel>();
  const [modalSdkVisible, setModalSdkVisible] = useState(false);
  const [time, setTime] = useState<DateType>(() => {
    const localDateType = window.sessionStorage.getItem('commonDateType');
    return localDateType ? JSON.parse(localDateType) : defaultTime;
  });
  const [showCheckedKey, setShowCheckedKey] = useState<string[]>(defaultShowValueList);
  const checkedList: string[] = [...showCheckedKey];
  const checkedColumnList: ColumnsType<IReportDetail>= checkedList.map(item => initColumnsList[item]);
 
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

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
    setShowCheckedKey(dataTargetOperationState.pageDataTarget);
  }, [dataTargetOperationState.pageDataTarget]);

  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 500),
    []
  );

  const toEdit = (channel) => {
    setModalSdkVisible(true);
    setSdkModalData(channel);
  };

  const columns: ProColumns<ISdkChannel>[] = [
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
        suffix: <SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />,
        placeholder: '请输入广告网络名称'
      }
    },
    {
      title: '广告网络',
      dataIndex: 'adnId',
      search: false,
      fixed: 'left',
      render: (_dom, channel) => (
        <Space size={16}>
          <Image src={channelIconMap[channel.adnId] ? channelIconMap[channel.adnId] : DefaultIcon} style={{width: '18px', height: 'auto'}}/>
          {channel.adnName}
        </Space>
      )
    },
    {
      title: '操作',
      render: (_dom, channel) => (<Space>
        <a onClick={(e) => {
          e.stopPropagation();
          setModalSdkVisible(true);
          setSdkModalData(channel);
        }}>编辑</a>
      </Space>),
      width: 150,
      align: 'center',
      search: false,
      fixed: 'left',
    },
    {
      title: '报表API',
      dataIndex: 'reportApiStatus',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (_dom, channel) => (<>
        {
          channel.reportApiStatus ? <Tag color={ 'success'}>已开通</Tag> : <Tag color={'default'} style={{cursor: 'pointer'}} onClick={() => toEdit(channel)}>未开通</Tag>
        }
      </>),
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      className: 'lucency',
      align: 'center',
      valueType: 'select',
      search: {
        transform: value => value === -1 ? {} : { status: value }
      },
      initialValue: -1,
      fixed: 'left',
      fieldProps: {
        onChange: () => formRef.current?.submit(),
        options: [
          { value: -1, label: '全部' },
          { value: 1, label: '使用中' },
          { value: 0, label: '未使用' }
        ]
      },
      render: (_dom, channel) => (<>
        <Tag color={channel.status ? 'success' : 'default'}>{channel.status ? '使用中' : '未使用'}</Tag>
      </>)
    },
  ];

  const _columns = columns.concat(checkedColumnList.map(item => (item.key == 'income' ? { ...item, hideInSearch: true, showSorterTooltip: false, sorter: false} : { ...item, hideInSearch: true, showSorterTooltip: false, sorter: false})));

  return (
    <>
      <ListPage<ISdkChannel, ChannelFilter>
        columns={_columns}
        request={async (params, sort) => {
          return {
            ...await channelDispatcher.getSdkList((formatParams(params, sort, time))),
            success: true
          };
        }}
        sticky={{ offsetHeader: 52 }}
        scroll={{x: 1400}}
        className={styles['channel-table']}
        rowKey='channelId'
        sortDirections={['descend', 'ascend', 'descend']}
        headerTitle={<>
          <Space className={styles['channel-list-time']} size={0}>
            <DataTargetOperation className='data-target-container' type='channel'/>
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
          </Space></>}
        dataSource={channelState.list}
        formRef={formRef}
        actionRef={actionRef}
        size='middle'
      />
      <ChannelSdkModalForm 
        channel={sdkModalData}
        visible={modalSdkVisible}
        onClose={() => setModalSdkVisible(false)}
        onFinish={() => {
          actionRef.current?.reload();
        }}
      />
    </>
  );
}

export default Channel;

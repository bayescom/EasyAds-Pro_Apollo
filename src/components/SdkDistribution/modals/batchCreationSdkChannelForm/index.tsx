import store from '@/store';
import { Modal, Space, Form, Button, Select, Input, Tooltip, Divider, Image } from 'antd';
import styles from './index.module.less';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import React, { useEffect, useRef, useState } from 'react';
import { generateRandomID } from '@/services/utils/utils';
import ListPage from '@/components/Utils/ListPage';
import { ProFormInstance } from '@ant-design/pro-form';
import { CheckCircleOutlined, CloseCircleOutlined, CopyOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import SdkChannelModalForm from '@/pages/Channel/sdkForm';
import { batchCreationAdspotChannelItem, ChannelList } from '@/models/types/sdkChannel';
import sdkChannelService from '@/services/sdkChannel';
import TargetingItem from '@/components/SdkDistribution/modals/formItems/TargetingItem';
import { formatPayloadDataFromModal } from './utils/formatBatchCrearionSdkChannel';
import { defaultBatchCrearionTableData } from '@/models/sdkChannel';
import BatchEditModal from './components/BatchEditModal';
import BatchCopyModal from './components/BatchCopyModal';
import { findIndex, targetingKeys } from './utils';
import { channelIconMap } from '@/components/Utils/Constant';

const { Option } =  Select;

type IProps = {
  batchCreationVisible: boolean,
  onCancel: () => void,
  modal: [],
  adspotId: number,
  mediaId: number | undefined,
  onFinish: (isSubmit?: boolean) => void,
}

const sdkChannelDispatcher = store.getModelDispatchers('sdkChannel');

function BatchCreationSdkChannelFormMoadl({ batchCreationVisible, onCancel, adspotId, mediaId, onFinish } : IProps) {
  const sdkChannelState = store.useModelState('sdkChannel');
  const distributionState = store.useModelState('distribution');
  const [channelList, setChannelList] = useState<ChannelList[]>([]);
  const [dataSource, setDataSource] = useState<batchCreationAdspotChannelItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string []>([]);

  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  // 每次打开弹窗都获取最新的channelList列表数据
  useEffect(() => {
    if (batchCreationVisible) {
      sdkChannelDispatcher.queryAll();
    }
  }, [batchCreationVisible]);

  useEffect(() => {
    const channelList = sdkChannelState.list.map(item => {
      return {
        label: item.adnName,
        value: item.adnId
      };
    });
    setChannelList(channelList);
  }, [sdkChannelState.list]);

  const handleChangeChannelAlias = (sdkChannelName, isHeadBidding, price) => {
    const adspotType = distributionState.adspotList.find(item => item.id == adspotId)?.adspotTypeName;
    let channelAlias = sdkChannelName + '_' + adspotType + '_';

    if (!isHeadBidding) {
      channelAlias = price ? channelAlias + price : channelAlias;
    } else {
      channelAlias = channelAlias + 'bidding';
    }
    return channelAlias;
  };

  const handleSubmit = async () => {
    // 过滤不需要验证的字段
    const defaultExcludedKey = ['deviceRequestInterval', 'dailyReqLimit', 'dailyImpLimit', 'deviceDailyReqLimit', 'deviceDailyImpLimit', 'channelAlias', 'bidRatio', 'price', 'location', 'maker', 'osv', 'appVersion'];
    const currentDataSourceIds = dataSource.map(item => item.id);
    const excludedFieldKeys: string[] = [];
    for(let i = 0; i < currentDataSourceIds.length; i++) {
      defaultExcludedKey.forEach(item => {
        const currentItem = `${currentDataSourceIds[i]}-${item}`;
        excludedFieldKeys.push(currentItem);
      });
    }
    const formValues = form.getFieldsValue();
    const validateFieldkeys = Object.keys(formValues).filter(item => !excludedFieldKeys.includes(item));
    
    form.validateFields(validateFieldkeys)
      .then(async () => {
        // 得到规整的数据数组
        const sdkChannelValues: ISdkAdspotChannel[] = [];
        for(let i = 0; i < currentDataSourceIds.length; i++) {
          const sdkChannel = {};
          for(const key in formValues) {
            const flag = key.split('-')[0];
            if (flag == currentDataSourceIds[i]) {
              sdkChannel[key.split('-')[1]] = formValues[key];
            }
          }
          sdkChannelValues.push(sdkChannel);
        }

        const result = sdkChannelValues.map((item, index) => {
          const params = {app_id: '', adspot_id: ''};
          const newItem = {...item, params};
          const sourceData = dataSource[index];
          // hasMetaAppKey 可以判断是否需要填写媒体key
          if (sourceData.hasMetaAppKey) {
            // isSeverHasSaveMetaAppKey 媒体Key后端有没有存储；severHasSaveMetaAppKey 存储的媒体Key
            if (!newItem['app_key']) {
              newItem.params['app_key'] = sourceData.severHasSaveMetaAppKey;
            } else {
              newItem.params['app_key'] = newItem['app_key'];
            }
          }
          // isSeverHasSaveMetaAppId 媒体ID后端有没有存储； severHasSaveMetaAppId 存储的媒体ID
          if (!newItem['app_id']) {
            if (sourceData.isSeverHasSaveMetaAppId) {
              newItem.params['app_id'] = sourceData.severHasSaveMetaAppId;
            }
          } else {
            newItem.params['app_id'] = newItem['app_id'];
          }
          newItem.params['adspot_id'] = newItem['adspot_id'];

          // isBidRatio 显示为固价框还是竞价框, 默认为竞价;
          if (!newItem.isHeadBidding) {
            newItem.isHeadBidding = sourceData.isBidRatio ? 1 : 0;
          }

          if ([2, 3, 5].includes(newItem.adnId)) {
            const currentReportApiParams = sdkChannelState.batchCreationAdspotChannel[sourceData.id].reportApiParams.filter(api => api.id == newItem.reportApiParamId);
            newItem.reportApiParam = currentReportApiParams[0];
          }

          return formatPayloadDataFromModal(newItem);
        });

        setConfirmLoading(true);
        const sdkAdspotChannelResult = await sdkChannelDispatcher.saveBatchSdkAdspotChannel({adspotId, model: result});
        if (sdkAdspotChannelResult) {
          onFinish(true);
          setConfirmLoading(false);
        } else {
          setConfirmLoading(false);
        }
      });
  };

  const handleClickChannel = async (value, channel, addRowDataSource?) => {
    const currnetChannel = sdkChannelState.map[value];
    // 每行选择的adnParamsMeta存起来，方便后续调用
    sdkChannelDispatcher.setBatchCreationAdspotChannel(channel.id, currnetChannel);
    // 选完广告网络后
    // 1. 先把adnParamsMeta放入map =》 单个form表单是为了得知下面那些动态参数都有啥，这里可以直接进行format
    // 2. 然后再看reportAPI是否有值，有值显示下拉，无值显示创建编辑reportAPI
    const newChannel = {...channel};
    // 需要填写app_key
    const hasMetaAppKey = currnetChannel.adnParamsMeta.filter(item => item.metaKey == 'app_key');
    if (hasMetaAppKey.length) {
      newChannel.hasMetaAppKey = true; 
    } else {
      newChannel.hasMetaAppKey = false; 
    }
    if (currnetChannel.adnParamsMeta.length) {
      await sdkChannelService.getMetaAppId({adspotId, sdkChannelId: value}).then(res => {
        if (res['app_id']) {
          newChannel.isSeverHasSaveMetaAppId = true,
          newChannel.severHasSaveMetaAppId = res['app_id'];
          form.setFieldValue(`${channel.id}-app_id`, res['app_id']);
        } else {
          newChannel.isSeverHasSaveMetaAppId = false,
          newChannel.severHasSaveMetaAppId = res['app_id'];
          form.setFieldValue(`${channel.id}-app_id`, res['app_id']);
        }

        if (hasMetaAppKey.length) {
          if (res['app_key']) {
            newChannel.isSeverHasSaveMetaAppKey = true,
            newChannel.severHasSaveMetaAppKey = res['app_key'];
            form.setFieldValue(`${channel.id}-app_key`, res['app_key']);
          } else {
            newChannel.isSeverHasSaveMetaAppKey = false,
            newChannel.severHasSaveMetaAppKey = res['app_key'];
            form.setFieldValue(`${channel.id}-app_key`, res['app_key']);
          }
        }
      });
    }

    // reportApi有值，需要展示下拉
    const currentReportApiParamsValue = currnetChannel.reportApiParams;
    // reportApiParamsMeta长度存在才有reportApi
    if (currnetChannel.reportApiParamsMeta.length) {
      // reportApi有长度
      if (currentReportApiParamsValue.length) {
        // 存在后端直接返回id为null，name为''的模版情况
        const hasNameParams = currentReportApiParamsValue.filter(item => item.name);
        if (hasNameParams.length) { // 确实有拥有name的参数存在
          const list = hasNameParams.map(item => {return {value: item.id, label: item.name};});
          // newChannel.hasReportApiParams = true;
          newChannel.showReportApi = true;
          newChannel.reportApiParamId = list[0].value;
          sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(channel.id, list);
          // name={`${channel.id}-reportApiParamId`} 自改版受控可编辑表格必须手动form赋值
          form.setFieldValue(`${channel.id}-reportApiParamId`, list[0].value);
        } else { // 没有真实的参数，只有返回的模版
          // newChannel.hasReportApiParams = false;
          newChannel.showReportApi = true;
        }
      } else { // 无长度
        newChannel.reportApiParamId = undefined;
        form.setFieldValue(`${channel.id}-reportApiParamId`, undefined);
        sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(channel.id, []);
        // newChannel.hasReportApiParams = false;
        newChannel.showReportApi = true;
      }
    } else {
      // 注意：这里是没有reportApi，也就是不需要填写这一项，需要变横杠的
      newChannel.reportApiParamId = undefined;
      form.setFieldValue(`${channel.id}-reportApiParamId`, undefined);
      sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(channel.id, []);
      // newChannel.hasReportApiParams = false;
      newChannel.showReportApi = false;
    }

    const channelAlias = handleChangeChannelAlias(currnetChannel.adnName, channel.isBidRatio, channel.price);
    const newDataSource = addRowDataSource ? addRowDataSource : [...dataSource];
    const changIndex = findIndex(channel.id, dataSource);
    newDataSource.splice(changIndex, 1, newChannel);
    setDataSource(newDataSource);
    form.setFieldValue(`${channel.id}-channelAlias`, channelAlias);
  };

  const handlePrice = (e, id) => {
    const price: string = e.target.value.trim();
    const isHeadBiddingForm = form.getFieldValue(`${id}-isHeadBidding`);
    const isHeadBidding = isHeadBiddingForm ? true : false;
    const channelAlias = handleChangeChannelAlias(sdkChannelState.batchCreationAdspotChannel[id].adnName, isHeadBidding, price);
    form.setFieldValue(`${id}-channelAlias`, channelAlias);
  };

  const handleEditMetaAppId = (channel) => {
    const text = form.getFieldValue(`${channel.id}-app_id`);
    // 对勾直接替换channel里存储的保存信息就可以
    const newChannel = {
      ...channel,
      severHasSaveMetaAppId: text,
      editAppId: false
    };
    const newDataSource = [...dataSource];
    const changeIndex = findIndex(channel.id, dataSource);
    newDataSource.splice(changeIndex, 1, newChannel);
    setDataSource(newDataSource);
  };

  const handleCancelEditMetaAppId = (channel) => {
    const newChannel = { ...channel, editAppId: false };
    const newDataSource = [...dataSource];
    const changIndex = findIndex(channel.id, dataSource);
    newDataSource.splice(changIndex, 1, newChannel);
    setDataSource(newDataSource);
    form.setFieldValue(`${channel.id}-app_id`, newChannel.severHasSaveMetaAppId);
  };

  const handleEditMetaAppKey = (channel) => {
    const text = form.getFieldValue(`${channel.id}-app_key`);
    // 对勾直接替换channel里存储的保存信息就可以
    const newChannel = {
      ...channel,
      severHasSaveMetaAppkey: text,
      editAppKey: false
    };
    const newDataSource = [...dataSource];
    const changeIndex = findIndex(channel.id, dataSource);
    newDataSource.splice(changeIndex, 1, newChannel);
    setDataSource(newDataSource);
  };

  const handleCancelEditMetaAppKey = (channel) => {
    const newChannel = { ...channel, editAppKey: false };
    const newDataSource = [...dataSource];
    const changeIndex = findIndex(channel.id, dataSource);
    newDataSource.splice(changeIndex, 1, newChannel);
    setDataSource(newDataSource);
    form.setFieldValue(`${channel.id}-app_key`, newChannel.severHasSaveMetaAppKey);
  };
  
  const columns: ProColumns<batchCreationAdspotChannelItem>[] = [
    { // 这里是直接渲染的从接口获取的数据，除了做setList，和forEach map外，无其他特殊处理
      title: <>广告网络<span className={styles['required-red']}></span></>,
      dataIndex: 'adnId',
      valueType: 'select',
      width: '110px',
      fixed: 'left',
      render: (_dom, channel) => (
        <Form.Item name={`${channel.id}-adnId`} rules={[{ required: true, message: '请选择' }]} initialValue={channel.adnId}>
          <Select
            className={styles['channel-id-select']}
            onChange={(value) => handleClickChannel(value, channel)}
          >
            {
              channelList.map(item => (<Option value={item.value} label={item.label} key={item.value}>
                <Tooltip title={item.label.length > 6 ? item.label : false}>{item.label}</Tooltip>
              </Option>))
            }
          </Select>
        </Form.Item>
      )
    },
    {
      title: <>账户名称<span className={styles['required-red']}></span></>,
      key: 'reportApiParamId',
      dataIndex: 'reportApiParamId',
      width: '110px',
      render: (dom, channel) => {
        return (<>
          {
            channel.showReportApi ? 
              <Form.Item name={`${channel.id}-reportApiParamId`} initialValue={channel.reportApiParamId} rules={[{ required: true, message: '请选择' }]}>
                <Select
                  className={styles['channel-id-select']}
                  popupClassName={styles['select-dropdown-render']}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space>
                        <Button 
                          type="text" 
                          icon={<PlusOutlined />} 
                          onClick={() => {
                            setModalVisible(true);
                            setModalData(sdkChannelState.batchCreationAdspotChannel[channel.id]);
                            sdkChannelDispatcher.setCurrentEditReportApiChannelInfo(sdkChannelState.batchCreationAdspotChannel[channel.id].adnId, channel.id);
                          }}
                          style={{width: '100%'}}
                        >
                          新增/编辑
                        </Button>
                      </Space>
                    </>
                  )}
                >
                  {
                    sdkChannelState.batchCreationAdspotChannelReportApiList[channel.id] && sdkChannelState.batchCreationAdspotChannelReportApiList[channel.id].length ? sdkChannelState.batchCreationAdspotChannelReportApiList[channel.id].map(item => (<Option value={item.value} label={item.label} key={item.value}>
                      <Tooltip title={item.label.length > 6 ? item.label : false}>{item.label}</Tooltip>
                    </Option>)) : <></>
                  }
                </Select>
              </Form.Item> : <>-</>
          }
        </>);
      },
    },
    {
      title: <>排序方式<span className={styles['required-red']}></span></>,
      dataIndex: 'isHeadBidding',
      width: '90px',
      render: (_dom, channel) => (
        <Form.Item name={`${channel.id}-isHeadBidding`}>
          <Select
            className={styles['channel-id-select']}
            options={[
              {label: '竞价', value: 1},
              {label: '固价', value: 0}
            ]}
            defaultValue={+channel.isBidRatio}
            onChange={(value) => {
              const newChannel = {...channel};
              newChannel.isBidRatio = value ? true : false;
              
              const newDataSource = [...dataSource];
              const changeIndex = findIndex(channel.id, dataSource);
              newDataSource.splice(changeIndex, 1, newChannel);
              const isHeadBidding = value ? true : false;
              const price = form.getFieldValue(`${channel.id}-price`);
              const channelAlias = handleChangeChannelAlias(sdkChannelState.batchCreationAdspotChannel[channel.id].adnName, isHeadBidding, price);
              setDataSource(newDataSource);
              // 每次切换排序方式的时候，都要把竞价系数重置为1
              form.setFieldValue(`${channel.id}-bidRatioPrice`, 1);
              form.setFieldValue(`${channel.id}-channelAlias`, channelAlias);
            }}
          />
        </Form.Item>
      )
    },
    { // bidRatioPrice 竞价系数/价格 这个不重要，主要看里面的`${channel.id}-bidRatio`和`${channel.id}-price`
      title: '竞价系数/价格',
      key: 'bidRatioPrice',
      dataIndex: 'bidRatioPrice',
      width: '100px',
      valueType: 'text',
      render: (_dom, channel) => {
        return (<>
          {
            channel.isBidRatio ? <Form.Item
              name={`${channel.id}-bidRatio`}
              rules={[
                { pattern: /^[0-9]*\.?\d{0,2}$/, message: '只能为数字,大于0,且最多保留两位小数'},
                { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
              ]}
              getValueFromEvent={e => e.target.value.trim()}
            >
              <Input placeholder="竞价系数" />
            </Form.Item> :
              <Form.Item
                name={`${channel.id}-price`}
                getValueProps={value => ({ value: value || null })}
                rules={[
                  { type: 'number', transform: value => +value, message: '价格格式不正确' }
                ]}
                getValueFromEvent={e => e.target.value.trim()}
              >
                <Input placeholder="请输入" suffix="¥" onChange={e => handlePrice(e, channel.id)}/>
              </Form.Item>
          }
        </>);
      }
    },
    {
      title: <Tooltip title='此媒体ID为您在第三方广告平台创建的媒体/应用ID，请填写在此处'><QuestionCircleOutlined />媒体ID<span className={styles['required-red']}></span></Tooltip>,
      key: 'app_id',
      dataIndex: 'app_id',
      width: '200px',
      render: (_dom, channel) => {
        return (<>
          {
            channel.isSeverHasSaveMetaAppId ? 
              channel.editAppId ? 
                <div className={styles['meta-app-id-operation-text']}>
                  <Form.Item name={`${channel.id}-app_id`} getValueFromEvent={e => e.target.value.trim()} rules={[{ required: true, type: 'string', message: '请输入' }]}><Input /></Form.Item>
                  <span className={styles['meta-app-id-operation-text-item']}>
                    <CheckCircleOutlined onClick={() => handleEditMetaAppId(channel)}/>
                    <CloseCircleOutlined onClick={() => handleCancelEditMetaAppId(channel)}/>
                  </span>
                </div>
                :
                <div className={styles['can-edit-info']}>
                  <Tooltip className={styles['can-edit-content']} title={channel.severHasSaveMetaAppId.length > 21 ? channel.severHasSaveMetaAppId : false}>{channel.severHasSaveMetaAppId}</Tooltip>
                  <span className={styles['can-edit-operation']}
                    onClick={() => {
                      const newChannel = {...channel};
                      newChannel.editAppId = true;
                      const newDataSource = [...dataSource];
                      const changIndex = findIndex(channel.id, dataSource);
                      newDataSource.splice(changIndex, 1, newChannel);
                      setDataSource(newDataSource);
                    }}
                  >编辑</span>
                </div> : <Form.Item name={`${channel.id}-app_id`} getValueFromEvent={e => e.target.value.trim()} rules={[{ required: true, type: 'string', message: '请输入' }]}><Input /></Form.Item>
          }
        </>);
      }
    },
    {
      title: <>媒体Key<span className={styles['required-red']}></span></>,
      key: 'app_key',
      dataIndex: 'app_key',
      width: '200px',
      render: (_dom, channel) => {
        return (<>
          {
            channel.hasMetaAppKey ? 
              channel.isSeverHasSaveMetaAppKey ? 
                channel.editAppKey ? 
                  <div className={styles['meta-app-id-operation-text']}>
                    <Form.Item name={`${channel.id}-app_key`} getValueFromEvent={e => e.target.value.trim()} rules={[{ required: true, type: 'string', message: '请输入' }]}><Input /></Form.Item>
                    <span className={styles['meta-app-id-operation-text-item']}>
                      <CheckCircleOutlined onClick={() => handleEditMetaAppKey(channel)}/>
                      <CloseCircleOutlined onClick={() => handleCancelEditMetaAppKey(channel)}/>
                    </span>
                  </div>
                  :
                  <div className={styles['can-edit-info']}>
                    <Tooltip className={styles['can-edit-content']} title={channel.severHasSaveMetaAppKey.length > 21 ? channel.severHasSaveMetaAppKey : false}>{channel.severHasSaveMetaAppKey}</Tooltip>
                    <span className={styles['can-edit-operation']}
                      onClick={() => {
                        const newChannel = {...channel};
                        newChannel.editAppKey = true;
                        const newDataSource = [...dataSource];
                        const changeIndex = findIndex(channel.id, dataSource);
                        newDataSource.splice(changeIndex, 1, newChannel);
                        setDataSource(newDataSource);
                      }}
                    >编辑</span>
                  </div> :
                <Form.Item name={`${channel.id}-app_key`} getValueFromEvent={e => e.target.value.trim()} rules={[{ required: true, type: 'string', message: '请输入' }]}>
                  <Input />
                </Form.Item> 
              : <>-</>
          }
        </>);
      }
    },
    {
      title: <Tooltip title='此广告位ID为您在第三方广告平台创建的广告位/代码位ID，请填写在此处'><QuestionCircleOutlined />广告位ID<span className={styles['required-red']}></span></Tooltip>,
      key: 'adspot_id',
      dataIndex: 'adspot_id',
      width: '200px',
      render: (_dom, channel) => (
        <Form.Item name={`${channel.id}-adspot_id`} getValueFromEvent={e => e.target.value.trim()} rules={[{ required: true, type: 'string', message: '请输入' }]}>
          <Input />
        </Form.Item>
      )
    },
    {
      title: '广告源名称',
      key: 'channelAlias',
      dataIndex: 'channelAlias',
      width: '165px',
      render: (_dom, channel) => (
        <Form.Item name={`${channel.id}-channelAlias`} getValueFromEvent={e => e.target.value.trim()}>
          <Input style={{padding: '4px 5px'}} placeholder="请输入"/>
        </Form.Item>
      )
    },
    {
      title: <>超时时间<span className={styles['required-red']}></span></>,
      key: 'timeout',
      dataIndex: 'timeout',
      width: '80px',
      valueType: 'text',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-timeout`}
          initialValue={channel.timeout}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { required: true, message: '请输入超时时间' },
            {
              type: 'number',
              transform: value => +value,
              message: '${label}格式不正确'
            },
            {
              type: 'number',
              transform: value => +value,
              min: 0,
              max: 10000, // TODO: 不同渠道设置不同的校验范围
              message: '${label}有效范围为${min}~${max}毫秒'
            },
          ]}
        >
          <Input value={channel.timeout} />
        </Form.Item>
      )
    },
    {
      title:  '地域定向',
      key: 'location',
      dataIndex: 'location',
      width: '260px',
      render: (_dom, channel) => {
        const config = { key: 'location', name: '', includeKey: `${channel.id}-location`, excludeKey: `${channel.id}-excludeLocation` };
        return (<div className={styles['batch-targeting-item']}>
          <TargetingItem
            labelCol={{}}
            wrapperCol={{}}
            key='location'
            config={config}
            model={sdkChannelState.batchTargetingModelMap[channel.id]}
            onRemove={(key) => console.log(key, 'remove key')}
            notRequired={true}
          />
        </div>);
      }
    },
    {
      title: '制造商定向',
      key: 'maker',
      dataIndex: 'maker',
      width: '260px',
      render: (_dom, channel) => {
        const config = { key: 'maker', name: '', includeKey: `${channel.id}-deviceMaker`, excludeKey: `${channel.id}-excludeDeviceMaker` };
        return (<div className={styles['batch-targeting-item']}>
          <TargetingItem
            labelCol={{}}
            wrapperCol={{}}
            key='maker'
            config={config}
            model={sdkChannelState.batchTargetingModelMap[channel.id]}
            onRemove={(key) => console.log(key, 'remove key')}
            notRequired={true}
          />
        </div>);
      }
    },
    {
      title: '操作系统版本定向',
      key: 'osv',
      dataIndex: 'osv',
      width: '260px',
      render: (_dom, channel) => {
        const config = { key: 'osv', name: '', includeKey: `${channel.id}-osv`, excludeKey: `${channel.id}-excludeOsv` };
        return (<div className={styles['batch-targeting-item']}>
          <TargetingItem
            labelCol={{}}
            wrapperCol={{}}
            key='osv'
            config={config}
            model={sdkChannelState.batchTargetingModelMap[channel.id]}
            mediumId={mediaId}
            onRemove={(key) => console.log(key, 'remove key')}
            notRequired={true}
          />
        </div>);
      }
    },
    {
      title:  'APP版本定向',
      key: 'appVersion',
      dataIndex: 'appVersion',
      width: '260px',
      render: (_dom, channel) => {
        const config = { key: 'appVersion', name: '', keys: [`${channel.id}-appVersion`] };
        return (<div className={styles['batch-targeting-item']}>
          <TargetingItem
            labelCol={{}}
            wrapperCol={{}}
            key='appVersion'
            config={config}
            model={sdkChannelState.batchTargetingModelMap[channel.id]}
            mediumId={mediaId}
            onRemove={(key) => console.log(key, 'remove key')}
            notRequired={true}
          />
        </div>);
      }
    },
    {
      title: '单设备最小请求间隔',
      key: 'deviceRequestInterval',
      dataIndex: 'deviceRequestInterval',
      width: '140px',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-deviceRequestInterval`}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: '日请求上限',
      key: 'dailyReqLimit',
      dataIndex: 'dailyReqLimit',
      width: '90px',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-dailyReqLimit`}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: '日展示上限',
      key: 'dailyImpLimit',
      dataIndex: 'dailyImpLimit',
      width: '90px',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-dailyImpLimit`}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: '单设备日请求上限',
      key: 'deviceDailyReqLimit',
      dataIndex: 'deviceDailyReqLimit',
      width: '120px',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-deviceDailyReqLimit`}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: '单设备日展示上限',
      key: 'deviceDailyImpLimit',
      dataIndex: 'deviceDailyImpLimit',
      width: '120px',
      render: (_dom, channel) => (
        <Form.Item
          name={`${channel.id}-deviceDailyImpLimit`}
          getValueFromEvent={e => e.target.value.trim()}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: '操作',
      key: 'deleteRow',
      dataIndex: 'deleteRow',
      width: '50px',
      fixed: 'right',
      render: (_dom, channel) => (<a key='deleteBtn' onClick={(e) => handleDeleteRow(e, channel.id)} className={styles['batch-delete-btn']}>删除</a>)
    }
  ];

  const handleAddRow = (adnId, type) => {
    const createRow = {
      ...defaultBatchCrearionTableData,
      id: generateRandomID(),
      adnId,
      isBidRatio: type ? true : false
    };
    const newData = [...dataSource, createRow];
    handleClickChannel(adnId, createRow, newData);
    const batchTargetingModelItem = {};
    targetingKeys.forEach(item => batchTargetingModelItem[item] = '');
    sdkChannelDispatcher.setBatchTargetingModelMap({key: createRow.id, batch: false, data: batchTargetingModelItem});
  };

  const handleDeleteRow = (e, id) => {
    e.stopPropagation();
    const newDataSource = dataSource.filter(item => item.id !== id);
    const newSelectedKeys = selectedRowKeys.filter(item => item !== id);
    setDataSource(newDataSource);
    setSelectedRowKeys(newSelectedKeys);
  };

  const handleClickBatchEdit = () => {
    setEditOpen(true);
  };

  const handleClickBatchCopy = () => {
    setCopyOpen(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  return (
    <Modal
      open={batchCreationVisible}
      onCancel={onCancel}
      width={1000}
      className={styles['batch-creation-modal']}
      okText="提交"
      okButtonProps={{disabled: dataSource.length ? false : true}}
      onOk={handleSubmit}
      afterClose={() => {
        setDataSource([]);
        setSelectedRowKeys([]);
      }}
      maskClosable={false}
      title='批量添加SDK广告源'
      confirmLoading={confirmLoading}
    >
      <Form form={form}>
        <ListPage<batchCreationAdspotChannelItem[], any>
          columns={columns}
          columnEmptyText='-'
          dataSource={dataSource}
          size="small"
          sticky={{ offsetHeader: 52 }}
          formRef={formRef}
          pagination={false}
          actionRef={actionRef}
          rowKey="id"
          toolBarRender={() => [
            <div key='addTableRow' className={styles['batch-header-operation']}>
              <div className={styles['header-operation-channel']}>
                {
                  channelList.length ? channelList.map(item => (<div className={styles['batch-header-operation-item']} key={item.value}>
                    <div className={styles['batch-header-operation-item-top']}>
                      <Image src={channelIconMap[item.value]} preview={false}/>
                      <span>{item.label}</span>
                    </div>
                    <div key='create' className={styles['batch-header-operation-item-bottom']}>
                      <span onClick={() => handleAddRow(item.value, 0)} className={styles['batch-header-operation-item-span']}><PlusOutlined />固价</span>
                      <span onClick={() => handleAddRow(item.value, 1)} className={styles['batch-header-operation-item-span']}><PlusOutlined />竞价</span>
                    </div>
                  </div>)) : <></>
                }
              </div>
              <div key='batchOperation' className={styles['header-batch-operation']}>
                <Button className={styles['header-batch-operation-span']} onClick={() => handleClickBatchCopy()}><CopyOutlined />批量粘贴</Button>
                <Button disabled={!selectedRowKeys.length} className={styles['header-batch-operation-span']} onClick={() => handleClickBatchEdit()}><EditOutlined />批量编辑</Button>
              </div>
            </div>
          ]}
          search={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          scroll={{x: 2500}}
          className={styles['batch-creation-form']}
          rowSelection={rowSelection}
        />
      </Form>

      <SdkChannelModalForm
        channel={modalData}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFinish={async () => {
          if (sdkChannelState.currentEditReportApiChannelId) {
            sdkChannelDispatcher.queryAll().then(res => {
              const data = res.data.filter(item => item.adnId == sdkChannelState.currentEditReportApiChannelId)[0];
              let list: {value: number, label: string}[] = [];
              const changeIndex = findIndex(sdkChannelState.currentEditReportApiId, dataSource);
              const newChannel = {...dataSource[changeIndex]};
              if (data.reportApiParams.length) {
                list = data.reportApiParams.map(item => {return {value: item.id, label: item.name};});
              }

              newChannel.reportApiParamId = list.length ? list[0].value : undefined;
              const newDataSource = [...dataSource];
              newDataSource.splice(changeIndex, 1, newChannel);
              setDataSource(newDataSource);
              // 更新当前行reportApiList下拉信息、当前行所选的渠道的信息、当前行的账户名称formValue值信息
              sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(sdkChannelState.currentEditReportApiId, list);
              sdkChannelDispatcher.setBatchCreationAdspotChannel(sdkChannelState.currentEditReportApiId, data);
              form.setFieldValue(`${sdkChannelState.currentEditReportApiId}-reportApiParamId`, newChannel.reportApiParamId);
            });
          }
        }}
      />

      <BatchEditModal
        editOpen={editOpen}
        adspotId={adspotId}
        mediaId={mediaId}
        onClose={() => setEditOpen(false)}
        dataSource={dataSource}
        setDataSource={(value) => setDataSource(value)}
        outerForm={form}
        selectedRowKeys={selectedRowKeys} 
      />

      <BatchCopyModal
        copyOpen={copyOpen}
        adspotId={adspotId}
        onClose={() => setCopyOpen(false)}
        dataSource={dataSource}
        setDataSource={(value) => setDataSource(value)}
        outerForm={form}
        selectedRowKeys={selectedRowKeys}
      />
    </Modal>
  );
}

export default BatchCreationSdkChannelFormMoadl;

import { ModalForm, ProFormInstance, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Col, Dropdown, Empty, Form, Menu, Row, Image, Divider, Space, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from '../index.module.less';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { defaultBatchEditDropdownSelect, findIndex, targetingItemsMap, targetingKeys } from '../utils';
import TargetingItem from '../../formItems/TargetingItem';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import store from '@/store';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import SdkChannelModalForm from '@/pages/Channel/sdkForm';
import { ISdkChannel } from '@/models/types/channel';
import { batchCreationAdspotChannelItem, ChannelList, formValueType, OptionList } from '@/models/types/sdkChannel';
import { channelIconMap } from '@/components/Utils/Constant';

type Iprops = {
  editOpen: boolean,
  adspotId: number,
  mediaId: number | undefined,
  onClose: () => void,
  dataSource: batchCreationAdspotChannelItem[],
  setDataSource: (value: batchCreationAdspotChannelItem[]) => void,
  outerForm: FormInstance<any>,
  selectedRowKeys: string[]
}

const sdkChannelDispatcher = store.getModelDispatchers('sdkChannel');

export default function BatchCopyModal({editOpen, adspotId, mediaId, onClose, dataSource, setDataSource, outerForm, selectedRowKeys}: Iprops) {
  const sdkAdspotChannelState = store.useModelState('sdkAdspotChannel');
  const sdkChannelState = store.useModelState('sdkChannel');
  const distributionState = store.useModelState('distribution');
  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();  

  const newSdkAdspotChannel: ISdkAdspotChannel = { ...sdkAdspotChannelState.new, adspotId };

  const [batchEditDropdownSelect, setBatchEditDropdownSelect] = useState(defaultBatchEditDropdownSelect);
  const [showEmpty, setShowEmpty] = useState(true);
  const [channelList, setChannelList] = useState<ChannelList[]>([]);

  const [showChannelId, setShowChannelId] = useState(false);
  const [showIsHeadBidding, setShowIsHeadBidding] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showMaker, setShowMaker] = useState(false);
  const [showOsv, setShowOsv] = useState(false);
  const [showAppVersion, setShowAppVersion] = useState(false);
  const [showDeviceRequestInterval, setShowDeviceRequestInterval] = useState(false);
  const [showDailyReqLimit, setShowDailyReqLimit] = useState(false);
  const [showDailyImpLimit, setShowDailyImpLimit] = useState(false);
  const [showDeviceDailyReqLimit, setShowDeviceDailyReqLimit] = useState(false);
  const [showDeviceDailyImpLimit, setShowDeviceDailyImpLimit] = useState(false);

  // reportApi
  const [showReportApi, setShowReportApi] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ISdkChannel>();
  const [adspotChannelReportApiList, setAdspotChannelReportApiList] = useState<OptionList[]>([]);

  const [submitterLoading, setSubmitterLoading] = useState(false);

  const isHeadBidding = Form.useWatch('isHeadBidding', form);
  const adnId = Form.useWatch('adnId', form);

  useEffect(() => {
    const channelList = sdkChannelState.list.map(item => {
      return {
        label: item.adnName,
        value: item.adnId
      };
    });
    setChannelList(channelList);
  }, [sdkChannelState.list]);

  useEffect(() => {
    const isShowEmpty =  showChannelId || showIsHeadBidding || showTimeout || showLocation || showMaker || showOsv || showAppVersion || showDeviceRequestInterval || showDailyReqLimit || showDailyImpLimit || showDeviceDailyReqLimit || showDeviceDailyImpLimit;
    setShowEmpty(!isShowEmpty);
  }, [showChannelId, showDailyImpLimit, showDailyReqLimit, showDeviceDailyImpLimit, showDeviceDailyReqLimit, showDeviceRequestInterval, showIsHeadBidding, showTimeout, showLocation, showMaker, showOsv, showAppVersion]);

  const handleClickSelect = (value, type) => {
    setShowEmpty(false);
    switch(value.key){
    case 'adnId':
      type == 'open' ? setShowChannelId(true) : setShowChannelId(false);
      break;
    case 'isHeadBidding':
      type == 'open' ? setShowIsHeadBidding(true) : setShowIsHeadBidding(false);
      break;
    case 'timeout':
      type == 'open' ? setShowTimeout(true) : setShowTimeout(false);
      break;
    case 'location':
      type == 'open' ? setShowLocation(true) : setShowLocation(false);
      break;
    case 'deviceMaker':
      type == 'open' ? setShowMaker(true) : setShowMaker(false);
      break;
    case 'osv':
      type == 'open' ? setShowOsv(true) : setShowOsv(false);
      break;
    case 'appVersion':
      type == 'open' ? setShowAppVersion(true) : setShowAppVersion(false);
      break;
    case 'deviceRequestInterval':
      type == 'open' ? setShowDeviceRequestInterval(true) : setShowDeviceRequestInterval(false);
      break;
    case 'dailyReqLimit':
      type == 'open' ? setShowDailyReqLimit(true) : setShowDailyReqLimit(false);
      break;
    case 'dailyImpLimit':
      type == 'open' ? setShowDailyImpLimit(true) : setShowDailyImpLimit(false);
      break;
    case 'deviceDailyReqLimit':
      type == 'open' ? setShowDeviceDailyReqLimit(true) : setShowDeviceDailyReqLimit(false);
      break;
    case 'deviceDailyImpLimit':
      type == 'open' ? setShowDeviceDailyImpLimit(true) : setShowDeviceDailyImpLimit(false);
      break;
    default: 
      console.log('default');
    }

    const clickFormItem = batchEditDropdownSelect.filter(item => item.key == value.key)[0];
    const currentClickFormItem = {...clickFormItem};
    currentClickFormItem.disable = (type == 'open' ? true : false);
    const newBatchEditDropdownSelect = [...batchEditDropdownSelect];
    const currentIndex = newBatchEditDropdownSelect.findIndex(item => item.key == value.key);
    newBatchEditDropdownSelect.splice(currentIndex, 1, currentClickFormItem);
    setBatchEditDropdownSelect(newBatchEditDropdownSelect);
  };

  const handleChangeChannelId = (value) => {
    const currnetChannel = sdkChannelState.map[value];
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
          setAdspotChannelReportApiList(list);
          setShowReportApi(true);
          form.setFieldValue('reportApiParamId', list[0].value);
        } else { // 没有真实的参数，只有返回的模版
          setShowReportApi(true);
        }
      } else { // 无长度
        setShowReportApi(true);
        form.setFieldValue('reportApiParamId', undefined);
        setAdspotChannelReportApiList([]);
      }
    } else {
      // 注意：这里是没有reportApi，也就是不需要填写这一项，需要变横杠的
      setShowReportApi(false);
      setAdspotChannelReportApiList([]);
    }
  };

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

  const handleSubmit = async (values) => {
    setSubmitterLoading(true);
    const outerFormValues = outerForm.getFieldsValue();
    const newFormValue: formValueType = {}; // 节源重复渲染
    const batchTargetingModelMap = {};

    const newDataSource = [...dataSource];
    // 因为只有勾选了row，才可以点击批量编辑，所以selectedRowKeys这里一定有值，且是Id数组
    selectedRowKeys.forEach(selectedRowKey => {
      const currentDataSourceItem = dataSource.filter(data => data.id == selectedRowKey)[0];
      const newDataSourceItem = {...currentDataSourceItem};
      const outerFormAdnId = outerFormValues[`${selectedRowKey}-adnId`];

      // 如果adnId或排序方式发生改变 因为它俩有共同点，都会影响广告源名称的改变
      if (values.adnId || values.isHeadBidding !== undefined) {
        if (values.adnId) {
          const currentSelectedChannel = sdkChannelState.map[values.adnId];
          let channelAlias; // 这个不能放外面，会引起一些情况的全部channelAlias = undefined
          // 只有当内部和外部的adnId不同才进行更改操作
          if (values.adnId !== outerFormAdnId) {
            // 如果更改adnId，也要更改对应的广告源名称
            let isHeadBidding, price;
            if (values.isHeadBidding !== undefined) { // 说明排序方式也更改了
              isHeadBidding = values.isHeadBidding;
              price = values.price ? values.price : undefined;
            } else { // 排序方式没有更改
              isHeadBidding = currentDataSourceItem.isBidRatio ? 1 : 0;
              price = currentDataSourceItem.isBidRatio ? undefined : outerFormValues[`${selectedRowKey}-price`];
            }
            channelAlias = handleChangeChannelAlias(currentSelectedChannel.adnName, isHeadBidding, price);
            newFormValue[`${selectedRowKey}-channelAlias`] = channelAlias;

            // 每行选择的adnParamsMeta存起来，方便后续调用
            sdkChannelDispatcher.setBatchCreationAdspotChannel(selectedRowKey, currentSelectedChannel);
            // 更改state里的当前id对应的reportApiList
            sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(selectedRowKey, adspotChannelReportApiList);

            // 还得更改媒体Key的显示与否
            const hasMetaAppKey = currentSelectedChannel.adnParamsMeta.filter(item => item.metaKey == 'app_key');
            newDataSourceItem.hasMetaAppKey = hasMetaAppKey.length ? true : false;

            // 是否有reportAPi
            newDataSourceItem.showReportApi = showReportApi;
            newFormValue[`${selectedRowKey}-reportApiParamId`] = values.reportApiParamId;
            // 目前统计受adnId连锁反应需要更改的项目有：adnId、账户、广告源名称
            newFormValue[`${selectedRowKey}-adnId`] = values.adnId;
            // 清空媒体Id、媒体Key相关参数
            const falseParams = ['editAppId', 'editAppKey', 'isSeverHasSaveMetaAppId', 'isSeverHasSaveMetaAppKey'];
            const clearSaveContent = ['severHasSaveMetaAppId', 'severHasSaveMetaAppKey'];
            falseParams.forEach(el => newDataSourceItem[el] = false);
            clearSaveContent.forEach(el => newDataSourceItem[el] = '');

            // adnId不等时清空app_id、app_key、adspot_id
            newFormValue[`${selectedRowKey}-app_id`] = undefined;
            newFormValue[`${selectedRowKey}-app_key`] = undefined;
            newFormValue[`${selectedRowKey}-adspot_id`] = undefined;
          } else {
            // adnId相同，会存在更改了账户名称的情况
            if ([2, 3, 5].includes(values.adnId)) {
              const outerFormReportApiParamId = outerFormValues[`${selectedRowKey}-reportApiParamId`];
              if (values.reportApiParamId !== outerFormReportApiParamId) {
                newFormValue[`${selectedRowKey}-reportApiParamId`] = values.reportApiParamId;
              }
            }
          }
        }

        // 如果表单不显示就是undefined，显示了会是1、0
        if (values.isHeadBidding !== undefined) {
          const adnId = values.adnId ? values.adnId : outerFormAdnId;
          const currentSelectedChannel = sdkChannelState.map[adnId];
          newFormValue[`${selectedRowKey}-isHeadBidding`] = values.isHeadBidding;
          let channelAlias;
          if (values.isHeadBidding) {
            newDataSourceItem.isBidRatio = true;
            newFormValue[`${selectedRowKey}-bidRatio`] = values.bidRatio;
            channelAlias = handleChangeChannelAlias(currentSelectedChannel.adnName, values.isHeadBidding, undefined);
          } else {
            newDataSourceItem.isBidRatio = false;
            newFormValue[`${selectedRowKey}-price`] = values.price;
            channelAlias = handleChangeChannelAlias(currentSelectedChannel.adnName, values.isHeadBidding, values.price);
          }
          newFormValue[`${selectedRowKey}-channelAlias`] = channelAlias;
        }

        const changIndex = findIndex(selectedRowKey, dataSource);
        newDataSource.splice(changIndex, 1, newDataSourceItem);
      }

      const formatKeys: string[] = [];
      defaultBatchEditDropdownSelect.forEach(child => {
        if (!['adnId', 'isHeadBidding', 'location', 'deviceMaker', 'osv', 'appVersion'].includes(child.key)) {
          formatKeys.push(child.key);
        }
      });

      // 除adnId、isHeadBidding、定向外，其它被更改的字段
      const hasEditKeyValueArray = formatKeys.filter(formatKey => values[formatKey]);
      hasEditKeyValueArray.forEach(editKey => {
        newFormValue[`${selectedRowKey}-${editKey}`] = values[editKey];
      });

      // 定向有更改才对state赋值
      if (showLocation || showMaker || showOsv || showAppVersion) {
        // 四个定向的包含、排除key
        const defaultTargetingDatakeys = targetingKeys.map(item => `${selectedRowKey}-${item}`);
        // 里面有值的定向
        const hasValueEditForm = targetingKeys.filter(item => values[item]); 
        const batchTargetingModelItem = {};
        // 外面的四个定向的值
        defaultTargetingDatakeys.forEach(item => batchTargetingModelItem[item] = outerFormValues[item]);
        hasValueEditForm.forEach(hasValueKey => {
          batchTargetingModelItem[`${selectedRowKey}-${hasValueKey}`] = values[hasValueKey];
          newFormValue[`${selectedRowKey}-${hasValueKey}`] = values[hasValueKey];
          switch(true) {
          case ['location', 'excludeLocation'].includes(hasValueKey):
            if (hasValueKey == 'location') {
              batchTargetingModelItem[`${selectedRowKey}-excludeLocation`] = undefined;
              newFormValue[`${selectedRowKey}-excludeLocation`] = undefined;
            } else {
              batchTargetingModelItem[`${selectedRowKey}-location`] = undefined;
              newFormValue[`${selectedRowKey}-location`] = undefined;
            }
            break;
          case ['deviceMaker', 'excludeDeviceMaker'].includes(hasValueKey):
            if (hasValueKey == 'deviceMaker') {
              batchTargetingModelItem[`${selectedRowKey}-excludeDeviceMaker`] = undefined;
              newFormValue[`${selectedRowKey}-excludeDeviceMaker`] = undefined;
            } else {
              batchTargetingModelItem[`${selectedRowKey}-deviceMaker`] = undefined;
              newFormValue[`${selectedRowKey}-deviceMaker`] = undefined;
            }
            break;
          case ['osv', 'excludeOsv'].includes(hasValueKey):
            if (hasValueKey == 'osv') {
              batchTargetingModelItem[`${selectedRowKey}-excludeOsv`] = undefined;
              newFormValue[`${selectedRowKey}-excludeOsv`] = undefined;
            } else {
              batchTargetingModelItem[`${selectedRowKey}-osv`] = undefined;
              newFormValue[`${selectedRowKey}-osv`] = undefined;
            }
            break;
          default:
            // 假设必然是app版本, appVersion取值为model.appVersion，因此这里需要专门赋值存储
            batchTargetingModelItem['appVersion'] = values[hasValueKey];
          }
        });
        batchTargetingModelMap[selectedRowKey] = batchTargetingModelItem;
      }
    });

    if (showLocation || showMaker || showOsv || showAppVersion) {
      sdkChannelDispatcher.setBatchTargetingModelMap({key: '', batch: true, data: batchTargetingModelMap});
    }

    setDataSource(newDataSource);
    await outerForm.setFieldsValue(newFormValue);
    setSubmitterLoading(false);
    onClose();
    return true;
  };

  const afterResetUseState = () => {
    showChannelId && setShowChannelId(false);
    showIsHeadBidding && setShowIsHeadBidding(false);
    showTimeout && setShowTimeout(false);
    showLocation && setShowLocation(false);
    showMaker && setShowMaker(false);
    showOsv && setShowOsv(false);
    showAppVersion && setShowAppVersion(false);
    showDeviceRequestInterval && setShowDeviceRequestInterval(false);
    showDailyReqLimit && setShowDailyReqLimit(false);
    showDailyImpLimit && setShowDailyImpLimit(false);
    showDeviceDailyReqLimit && setShowDeviceDailyReqLimit(false);
    showDeviceDailyImpLimit && setShowDeviceDailyImpLimit(false);
    setBatchEditDropdownSelect(defaultBatchEditDropdownSelect);
  };

  return (<ModalForm
    formRef={formRef}
    form={form}
    open={editOpen}
    width={663}
    title='批量编辑'
    layout="horizontal"
    onFinish={(value) => handleSubmit(value)}
    modalProps={{
      maskClosable: false,
      okText: '提交',
      onCancel: () => {
        onClose();
      },
      afterClose: () => {
        formRef.current?.resetFields();
        afterResetUseState();
      },
      bodyStyle: { paddingBottom: 0 },
      className: styles['batch-edit-modal'],
    }}
    submitter={{
      submitButtonProps: { disabled: showEmpty, loading: submitterLoading }
    }}
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 24 }}
    initialValues={{
      isHeadBidding: 1,
      timeout: 5000
    }}
  >
    {showEmpty && <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className={styles['empty-container']}
      description={<>点击【+ 添加批量编辑选项】按钮操作需要批量编辑的内容</>}
    />}
    <Dropdown
      overlay={<Menu
        onClick={(value) => handleClickSelect(value, 'open')}
        items={batchEditDropdownSelect.map(item => {
          return {
            key: item.key,
            label: (<div>{item.label}</div>),
            disabled: item.disable
          };
        })}
      />}
      overlayClassName={styles['create-button-dropdown']}
      className={styles['batch-add-button']}
    >
      <a><PlusOutlined />&nbsp;添加批量编辑选项</a>
    </Dropdown>

    {showChannelId && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <Col>
          <ProFormSelect
            name="adnId"
            label="广告网络"
            rules={[{ required: true, type: 'number', message: '请选择${label}' }]}
            placeholder="请选择"
            required
            options={channelList}
            fieldProps={{
              optionItemRender(item) {
                return (<><Image src={channelIconMap[item.value]} style={{width: '20px', height: 'auto', marginRight: '10px'}} preview={false}/>{item.label}</>);
              },
              allowClear: false,
              onChange: (value) => handleChangeChannelId(value)
            }}
          />
        </Col>
        <Col>
          {showReportApi && <ProFormSelect
            options={adspotChannelReportApiList}
            name="reportApiParamId"
            label="账户名称"
            fieldProps={{
              allowClear: false,
              dropdownRender: (menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space>
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      onClick={() => {
                        setModalVisible(true);
                        setModalData(sdkChannelState.map[adnId]);
                      }}
                      style={{width: '100%'}}
                    >
                      新增/编辑
                    </Button>
                  </Space>
                </>
              )
            }}
            rules={[{ required: true, type: 'number', message: '请选择${label}' }]}
            placeholder="请选择"
            required
          />}
        </Col>
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'adnId'}, 'close')}/>
      </Col>
    </Row>}
    {showIsHeadBidding && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['head-bidding-group']}>
        <ProFormRadio.Group
          name="isHeadBidding"
          label="排序方式"
          radioType="button"
          options={[
            {
              label: '实时竞价',
              value: 1,
            },
            {
              label: '固价',
              value: 0,
            }
          ]}
          required
        />
        {isHeadBidding == 0 ? <ProFormText
          name='price'
          label='价格'
          rules={[{ type: 'number', transform: value => +value, message: '价格格式不正确' }]}
          required={true}
          placeholder="请输入"
        /> :
          <ProFormText
            name='bidRatio'
            label='竞价系数'
            rules={[
              { pattern: /^[0-9]*\.?\d{0,2}$/, message: '只能为数字,大于0,且最多保留两位小数'},
              { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
            ]}
            required={true}
            placeholder="请输入"
          />}
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'isHeadBidding'}, 'close')}/>
      </Col>
    </Row>}
    {showTimeout && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['head-bidding-group']}>
        <ProFormText
          name="timeout"
          label="超时时间"
          required={true}
          placeholder="请输入"
          rules={[
            { required: true, message: '请输入${label}' },
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
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'timeout'}, 'close')}/>
      </Col>
    </Row>}

    {/* 定向 */}
    {showLocation && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['batch-targeting-item']}>
        <TargetingItem
          labelCol={{span: 7}}
          wrapperCol={{}}
          key='location'
          config={targetingItemsMap['location']}
          model={formatModalDataFromPayload(newSdkAdspotChannel)}
          onRemove={(key) => console.log(key, 'remove key')}
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'location'}, 'close')}/>
      </Col>
    </Row>}
    {showMaker && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['batch-targeting-item']}>
        <TargetingItem
          labelCol={{span: 7}}
          wrapperCol={{}}
          key='maker'
          config={targetingItemsMap['maker']}
          model={formatModalDataFromPayload(newSdkAdspotChannel)}
          onRemove={(key) => console.log(key, 'remove key')}
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'deviceMaker'}, 'close')}/>
      </Col>
    </Row>}
    {showOsv && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['batch-targeting-item']}>
        <TargetingItem
          labelCol={{span: 7}}
          wrapperCol={{}}
          key='osv'
          config={targetingItemsMap['osv']}
          model={formatModalDataFromPayload(newSdkAdspotChannel)}
          mediumId={mediaId}
          onRemove={(key) => console.log(key, 'remove key')}
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'osv'}, 'close')}/>
      </Col>
    </Row>}
    {showAppVersion && <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['batch-targeting-item']}>
        <TargetingItem
          labelCol={{span: 7}}
          wrapperCol={{}}
          key='appVersion'
          config={targetingItemsMap['appVersion']}
          model={formatModalDataFromPayload(newSdkAdspotChannel)}
          mediumId={mediaId}
          onRemove={(key) => console.log(key, 'remove key')}
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'appVersion'}, 'close')}/>
      </Col>
    </Row>}

    {/* 频次 */}
    {showDeviceRequestInterval && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <ProFormText
          name='deviceRequestInterval'
          label='单设备最小请求间隔'
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
          getValueProps={(value) => ({value: value || null})}
          required={true}
          placeholder="请输入"
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'deviceRequestInterval'}, 'close')}/>
      </Col>
    </Row>}
    {showDailyReqLimit && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <ProFormText
          name='dailyReqLimit'
          label='日请求上限'
          getValueProps={(value) => ({value: value || null})}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
          required={true}
          placeholder="请输入"
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'dailyReqLimit'}, 'close')}/>
      </Col>
    </Row>}
    {showDailyImpLimit && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <ProFormText
          name='dailyImpLimit'
          label='日展示上限'
          getValueProps={(value) => ({value: value || null})}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
          required={true}
          placeholder="请输入"
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'dailyImpLimit'}, 'close')}/>
      </Col>
    </Row>}
    {showDeviceDailyReqLimit && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <ProFormText
          name='deviceDailyReqLimit'
          label='单设备日请求上限'
          getValueProps={(value) => ({value: value || null})}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
          required={true}
          placeholder="请输入"
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'deviceDailyReqLimit'}, 'close')}/>
      </Col>
    </Row>}
    {showDeviceDailyImpLimit && <Row className={styles['batch-edit-row']}>
      <Col span={20}>
        <ProFormText
          name='deviceDailyImpLimit'
          label='单设备日展示上限'
          getValueProps={(value) => ({value: value || null})}
          rules={[
            { type: 'number', transform: value => +value, message: '格式不正确' },
            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
          ]}
          required={true}
          placeholder="请输入"
        />
      </Col>
      <Col span={4} className={styles['batch-edit-close-col']}>
        <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'deviceDailyImpLimit'}, 'close')}/>
      </Col>
    </Row>}

    <SdkChannelModalForm
      channel={modalData}
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      onFinish={async () => {
        if (adnId) {
          sdkChannelDispatcher.queryAll().then(res => {
            const data = res.data.filter(item => item.adnId == adnId)[0];
            let list: {value: number, label: string}[] = [];
            if (data.reportApiParams.length) {
              list = data.reportApiParams.map(item => {return {value: item.id, label: item.name};});
            }
            const newReportApiParamId = list.length ? list[0].value : undefined;
            form.setFieldValue('reportApiParamId', newReportApiParamId);
            setAdspotChannelReportApiList(list);
          });
        }
      }}
    />
  </ModalForm>);
}

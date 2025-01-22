import { ModalForm, ProFormInstance, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Col, Form, Row, Image, Divider, Space, FormInstance, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from '../index.module.less';
import { PlusOutlined } from '@ant-design/icons';
import { targetingKeys } from '../utils';
import store from '@/store';
import SdkChannelModalForm from '@/pages/Channel/sdkForm';
import { ISdkChannel } from '@/models/types/channel';
import { batchCreationAdspotChannelItem, ChannelList, formValueType, OptionList } from '@/models/types/sdkChannel';
import sdkChannelService from '@/services/sdkChannel';
import MetaAppId from '../../selectedChannelConfigs/components/MetaAppId';
import MetaAppKey from '../../selectedChannelConfigs/components/MetaAppKey';
import { formatString2Array, generateRandomID } from '@/services/utils/utils';
import { defaultBatchCrearionTableData } from '@/models/sdkChannel';
import { channelIconMap } from '@/components/Utils/Constant';

type Iprops = {
  copyOpen: boolean,
  adspotId: number,
  onClose: () => void,
  dataSource: batchCreationAdspotChannelItem[],
  setDataSource: (value: batchCreationAdspotChannelItem[]) => void,
  outerForm: FormInstance<any>,
  selectedRowKeys: string[]
}

const sdkChannelDispatcher = store.getModelDispatchers('sdkChannel');

export default function BatchCopyModal({copyOpen, adspotId, onClose, dataSource, setDataSource, outerForm, selectedRowKeys}: Iprops) {
  const sdkChannelState = store.useModelState('sdkChannel');
  const distributionState = store.useModelState('distribution');
  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();  

  const [channelList, setChannelList] = useState<ChannelList[]>([]);
  const [showMetaAppKey, setShowMetaAppKey] = useState(false);

  // reportApi
  const [showReportApi, setShowReportApi] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ISdkChannel>();
  const [adspotChannelReportApiList, setAdspotChannelReportApiList] = useState<OptionList[]>([]);

  // 应用ID/媒体ID是否有值
  const [metaAppIdDisabled, setMetaAppIdDisabled] = useState(false);
  const [savePervMetaAppId, setSavePervMetaAppId] = useState<string | null>(null);
  // 后端是否存有值app_id
  const [isSeverHasSaveMetaAppId, setIsSeverHasSaveMetaAppId] = useState(false);
  // 媒体Key是否有值
  const [metaAppKeyDisabled, setMetaAppKeyDisabled] = useState(false);
  const [savePervMetaAppKey, setSavePervMetaAppKey] = useState<string | null>(null);
  // 后端是否存有值app_key
  const [isSeverHasSaveMetaAppKey, setIsSeverHasSaveMetaAppKey] = useState(false);

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

  const handleChangeChannelId = (value) => {
    const currnetChannel = sdkChannelState.map[value];
    // reportApi有值，需要展示下拉
    const currentReportApiParamsValue = currnetChannel.reportApiParams;
    if (currnetChannel.reportApiParamsMeta.length) { // reportApiParamsMeta长度存在才有reportApi
      if (currentReportApiParamsValue.length) { // reportApi有长度
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
    } else { // 注意：这里是没有reportApi，也就是不需要填写这一项，需要变横杠的
      setShowReportApi(false);
      setAdspotChannelReportApiList([]);
    }

    const hasMetaAppKeyIndex = currnetChannel.adnParamsMeta.findIndex(item => item.metaKey == 'app_key');
    hasMetaAppKeyIndex !== -1 ? setShowMetaAppKey(true) : setShowMetaAppKey(false);
    if (currnetChannel.adnParamsMeta.length) {
      sdkChannelService.getMetaAppId({adspotId, sdkChannelId: value}).then(res => {
        if (res['app_id']) {
          setMetaAppIdDisabled(true);
          setIsSeverHasSaveMetaAppId(true);
          setSavePervMetaAppId(res['app_id']);
          form.setFieldValue(['params', 'app_id'], res['app_id']);
        } else {
          setSavePervMetaAppId(res['app_id']);
          setMetaAppIdDisabled(false);
          setIsSeverHasSaveMetaAppId(false);
        }

        if (hasMetaAppKeyIndex !== -1) {
          if (res['app_key']) {
            setMetaAppKeyDisabled(true);
            setIsSeverHasSaveMetaAppKey(true);
            setSavePervMetaAppKey(res['app_key']);
            form.setFieldValue(['params', 'app_key'], res['app_key']);
          } else {
            setSavePervMetaAppKey(res['app_key']);
            setMetaAppKeyDisabled(false);
            setIsSeverHasSaveMetaAppKey(false);
          }
        }
      });
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
    const flag = verificationBeforeSubmit();
    if (flag) {
      message.error('竞价系数/价格、广告源名称的数量必须与广告位ID的数量相同！');
      return;
    }
    
    setSubmitterLoading(true);
    // 批量粘贴以广告位ID为基准，数量=将要新添加的行数
    const addRowKeys = formatString2Array(values['adspot_id']);
    const bidRatio = formatString2Array(values.bidRatio);
    const price = formatString2Array(values.price);
    const addDataSource: batchCreationAdspotChannelItem[] = [];
    const currnetChannel = sdkChannelState.map[values.adnId];
    // 广告网络、账户名称、超时时间、排序方式的值取自createRow
    addRowKeys.forEach(key => {
      const createRow = {
        ...defaultBatchCrearionTableData,
        id: generateRandomID(),
        adnId: values.adnId,
        reportApiParamId: values.reportApiParamId,
        timeout: values.timeout,
        showReportApi: showReportApi,
        hasMetaAppKey: showMetaAppKey,
        isBidRatio: values.isHeadBidding ? true : false,
        isSeverHasSaveMetaAppId: isSeverHasSaveMetaAppId,
        severHasSaveMetaAppId: savePervMetaAppId ? savePervMetaAppId : '',
        isSeverHasSaveMetaAppKey: isSeverHasSaveMetaAppKey,
        severHasSaveMetaAppKey: savePervMetaAppKey ? savePervMetaAppKey : ''
      };
      addDataSource.push(createRow);
    });

    let channelAlias;
    if (values.channelAlias) {
      channelAlias = formatString2Array(values.channelAlias);
    }
    const newFormValue: formValueType = {}; // 节源重复渲染
    const batchTargetingModelMap = {};
    // 媒体ID、媒体Key、广告位ID、价格、竞价系数、广告源名称 需要手动赋值
    const addDataSourceKeys = addDataSource.map(item => item.id);
    addDataSourceKeys.forEach((dataId, index) => {
      // 如果isSeverHasSaveMetaAppId是false，那么页面必然会有值，就可以取values的，isSeverHasSaveMetaAppKey同理
      if (isSeverHasSaveMetaAppId) {
        newFormValue[`${dataId}-app_id`] = savePervMetaAppId;
      } else {
        newFormValue[`${dataId}-app_id`] = values.params['app_id'];
      }

      if (showMetaAppKey) {
        if (isSeverHasSaveMetaAppKey) {
          newFormValue[`${dataId}-app_key`] = savePervMetaAppKey;
        } else {
          newFormValue[`${dataId}-app_key`] = values.params['app_key'];
        }
      }

      newFormValue[`${dataId}-adspot_id`] = addRowKeys[index];

      // 1 竞价，0 固价
      if (values.isHeadBidding) {
        newFormValue[`${dataId}-bidRatio`] = bidRatio[index];
      } else {
        newFormValue[`${dataId}-price`] = price[index];
      }
      
      if (values.channelAlias) {
        newFormValue[`${dataId}-channelAlias`] = channelAlias[index];
      }
      
      const batchTargetingModelItem = {};
      targetingKeys.forEach(item => batchTargetingModelItem[`${dataId}-${item}`] = '');
      batchTargetingModelMap[dataId] = batchTargetingModelItem;

      sdkChannelDispatcher.setBatchCreationAdspotChannel(dataId, currnetChannel);
      sdkChannelDispatcher.setBatchCreationAdspotChannelReportApiList(dataId, adspotChannelReportApiList);
    });

    sdkChannelDispatcher.setBatchTargetingModelMap({key: '', batch: true, data: batchTargetingModelMap});
    if (!values.channelAlias) {
      if (price.length) {
        addDataSourceKeys.forEach((item, index) => {
          const finalChannelAlias = handleChangeChannelAlias(currnetChannel.adnName, values.isHeadBidding, price[index]);
          newFormValue[`${item}-channelAlias`] = finalChannelAlias;
        });
      } else {
        const finalChannelAlias = handleChangeChannelAlias(currnetChannel.adnName, values.isHeadBidding, values.price);
        addDataSourceKeys.forEach(item => newFormValue[`${item}-channelAlias`] = finalChannelAlias);
      }
    }
    
    const newData = [...dataSource, ...addDataSource];
    setDataSource(newData);
    await outerForm.setFieldsValue(newFormValue);
    setSubmitterLoading(false);
    onClose();
  };

  const verificationBeforeSubmit = () => {
    let priceOrBidRatio;
    let biddingFlag = false;
    let AliasFlag = false;
    if (isHeadBidding) {
      priceOrBidRatio = form.getFieldValue('bidRatio');
    } else {
      priceOrBidRatio = form.getFieldValue('price');
    }
    const metaAdspotId = form.getFieldValue('adspot_id');
    const channelAlias = form.getFieldValue('channelAlias');
    if (priceOrBidRatio || channelAlias) {
      const currentMetaAdspotId = formatString2Array(metaAdspotId);
      if (priceOrBidRatio) {
        const currentPriceOrBidRatio = formatString2Array(priceOrBidRatio);
        biddingFlag = currentPriceOrBidRatio.length == currentMetaAdspotId.length ? false : true;
      }

      if (channelAlias) {
        const currentChannelAlias = formatString2Array(channelAlias);
        AliasFlag = currentChannelAlias.length == currentMetaAdspotId.length ? false : true;
      }
    }

    return biddingFlag || AliasFlag;
  };

  const afterResetUseState = () => {
    setShowMetaAppKey(false);
    setShowReportApi(false);
    setAdspotChannelReportApiList([]);
    setMetaAppIdDisabled(false);
    setSavePervMetaAppId(null);
    setIsSeverHasSaveMetaAppId(false);
    setMetaAppKeyDisabled(false);
    setSavePervMetaAppKey(null);
    setIsSeverHasSaveMetaAppKey(false);
  };

  return (<ModalForm
    formRef={formRef}
    form={form}
    open={copyOpen}
    width={663}
    title='单个广告源批量粘贴'
    layout="horizontal"
    onFinish={handleSubmit}
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
      className: styles['batch-copy-modal'],
    }}
    submitter={{
      submitButtonProps: { loading: submitterLoading }
    }}
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 24 }}
    initialValues={{
      isHeadBidding: 1,
      timeout: 5000
    }}
  >
    <Row className={styles['batch-edit-row']}>
      <Col span={20}>
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
      {showReportApi && <Col span={20}>
        <ProFormSelect
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
        />
      </Col>}
      
      <MetaAppId 
        config={{ metaKey: 'app_id', metaName: '媒体ID'}}
        isSeverHasSaveMetaAppId={isSeverHasSaveMetaAppId}
        metaAppIdDisabled={metaAppIdDisabled}
        savePervMetaAppId={savePervMetaAppId}
        setMetaAppIdDisabled={(value) => setMetaAppIdDisabled(value)}
        setSavePervMetaAppId={(value) => setSavePervMetaAppId(value)}
        customColSpan={20}
        className='batch-copy-meta-key'
      />
    
      {showMetaAppKey && <MetaAppKey
        config={{ metaKey: 'app_key', metaName: '媒体Key'}}
        isSeverHasSaveMetaAppKey={isSeverHasSaveMetaAppKey}
        metaAppKeyDisabled={metaAppKeyDisabled}
        savePervMetaAppKey={savePervMetaAppKey}
        setMetaAppKeyDisabled={(value) => setMetaAppKeyDisabled(value)}
        setSavePervMetaAppKey={(value) => setSavePervMetaAppKey(value)}
        customColSpan={20}
        className='batch-copy-meta-key'
      />}
      
    </Row>
    <Row className={styles['batch-copy-row']}>
      <Col span={20} className={styles['head-copy-group']}>
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
        {isHeadBidding == 0 ? <ProFormTextArea
          name='price'
          label='价格'
          placeholder="支持输入多个价格，多个请用逗号或换行符隔开"
          rules={[
            {
              validator: (_, value) => {
                const formatValue = formatString2Array(value);
                for(const key in formatValue) {
                  if (isNaN(+formatValue[key])) {
                    return Promise.reject('价格格式不正确');
                  }
                }
                return Promise.resolve(); 
              },
            },
          ]}
        /> :
          <ProFormTextArea
            name='bidRatio'
            label='竞价系数'
            placeholder="支持输入多个竞价系数，多个请用逗号或换行符隔开"
            rules={[
              {
                validator: (_, value) => {
                  const formatValue = formatString2Array(value);
                  for(const key in formatValue) {
                    if (!/^[0-9]*\.?\d{0,2}$/.test(formatValue[key])) {
                      return Promise.reject('只能为数字,大于0,且最多保留两位小数');
                    } else if (!isNaN(+formatValue[key])) {
                      if (+formatValue[key] < 0) {
                        return Promise.reject('应该大于0');
                      }
                    }
                  }
                  return Promise.resolve(); 
                },
              },
            ]}
          />}
      </Col>
    </Row>
    <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['head-bidding-group']}>
        <ProFormTextArea
          name="adspot_id"
          label="广告位ID"
          required={true}
          tooltip='此广告位ID为您在第三方广告平台创建的广告位/代码位ID，请填写在此处'
          placeholder="支持输入多个广告位Id，多个请用逗号或换行符隔开"
          rules={[{ required: true, type: 'string', message: '请输入' }]}
        />
      </Col>
      <Col span={20}>
        <ProFormTextArea
          name='channelAlias'
          label='广告源名称'
          placeholder="支持输入多个广告源名称，多个请用逗号或换行符隔开"
        />
      </Col>
    </Row>
    <Row className={styles['batch-edit-row']}>
      <Col span={20} className={styles['head-bidding-group']}>
        <ProFormText
          name="timeout"
          label="超时时间"
          placeholder="请输入"
          rules={[
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
    </Row>

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

import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { ISdkChannel, ReportApiParam } from '@/models/types/sdkChannel';
import store from '@/store';
import { Col, Divider, Form, Input, Modal, Row, Select, Typography, Space, Image, Radio, Switch, Button, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { isCommonConfig, TargetingItemConfig } from './formItems/TargetingItem';
import styles from './index.module.less';
import RTB from '@/assets/icons/RTB.png';
import TargetingItemsPicker from './TargetingItemsPicker';
import { formatPayloadDataFromModal } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import { formatYlhPayloadDataFromModal } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils/formatYlhSdkAutoAdspot';
import { PlusOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import SdkChannelModalForm from '@/pages/Channel/sdkForm';
import ProCard from '@ant-design/pro-card';
import React from 'react';
import sdkChannelService from '@/services/sdkChannel';
import SelectedChannelConfigs from './selectedChannelConfigs';
import { channelIconMap, autoCreateStatusTipMap, sdkReportApiChannels } from '@/components/Utils/Constant';
import auto from '@/assets/icons/distribution/auto.png';
import SdkAutoAdspot from './sdkAutoAdspot';
import { channelSource } from './sdkAutoAdspot/utils';
import TextArea from 'antd/lib/input/TextArea';

type Props = {
  model,
  adspotId: number,
  visible: boolean,
  isEditing: boolean,
  cancel: (isSubmit?: boolean) => void,
  mediaId: number | undefined
};

const { Text, Title } = Typography;

const targetingItems: TargetingItemConfig[] = [
  { key: 'location', name: '地域', includeKey: 'location', excludeKey: 'excludeLocation' },
  { key: 'maker', name: '制造商', includeKey: 'deviceMaker', excludeKey: 'excludeDeviceMaker' },
  { key: 'osv', name: '操作系统版本', includeKey: 'osv', excludeKey: 'excludeOsv' },
  { key: 'appVersion', name: 'APP版本', keys: ['appVersion'] },
];

const targetingItemDefaultValues = targetingItems.reduce((pre, item) => {
  if (isCommonConfig(item)) {
    pre[item.includeKey] = '';
    pre[item.excludeKey] = '';
  } else {
    item.keys.forEach(key => {
      pre[key] = '';
    });
  }

  return pre;
}, {});

const defaultReportApiParam = {name: '', id: 0, channelParams: {}, status: 0, autoCreateStatus: 0};

const sdkAdspotChannelDispatchers = store.getModelDispatchers('sdkAdspotChannel');
const sdkChannelDispatchers = store.getModelDispatchers('sdkChannel');

function SdkAdspotChannelForm({
  visible,
  model,
  adspotId,
  cancel,
  isEditing,
  mediaId
}: Props) {
  const sdkChannelState = store.useModelState('sdkChannel');
  const adspot = store.useModelState('adspot');
  const distributionState = store.useModelState('distribution');
  const [selectedChannel, setSelectedChannel] = useState<ISdkChannel | null>();
  const [form] = Form.useForm();
  const isHeadBidding = Form.useWatch('isHeadBidding', form);
  const switchFcrequency = Form.useWatch('switchFcrequency', form);
  const bidPrice = Form.useWatch('bidPrice', form);
  const select = Form.useWatch('select', form);
  const switchReportApi = Form.useWatch('switchReportApi', form);
  const autoCreateStatus = Form.useWatch('autoCreateStatus', form);
  const checkedReportApi = Form.useWatch('checkedReportApi', form);
  const metaAppId = Form.useWatch(['channelParams', 'meta_app_id'], form);
  const channelAlias = Form.useWatch('channelAlias', form);

  const [showFcrequencySetting, setShowFcrequencySetting] = useState(false);
  // 媒体Adx不显示广告源名称、超时时间、定向设置、频次设置
  const [isMediaAdx, setIsMediaAdx] = useState(false);
  // 弹窗左侧滚动列表
  const [scrollChannelList, setScrollChannelList] = useState<ISdkChannel[]>();
  // 选中的adnId
  const [clickChannel, setClickChannel] = useState<number | undefined>();
  // 当前广告网络是否创建过reportApi
  const [isHasReportApiParams, setIsHasReportApiParams] = useState(false);
  // reportApi参数列表
  const [reportApiList, setReportApiList] = useState<{id: number | null, name: string}[]>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
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

  // 动态设置左侧滚动区域高度
  const [rightContainerHeight, setRightContainerHeight] = useState<number | undefined>(undefined);
  const [changeLeftContianerHeight, setChangeLeftContianerHeight] = useState(false);
  const sdkRightContainer = document.getElementById('sdk-right-container');

  const [drawerFormVisible, setDrawerFormVisible] = useState(false);
  const [isCreateThird, setIsCreateThird] = useState(false);
  const [currentReportApiParam, setCurrentReportApiParam] = useState<ReportApiParam>(defaultReportApiParam);
  const [thirdModalData, setThirdModalData] = useState<Record<string, any> | null>();
  const [disabledMetaAdspotId, setDisabledMetaAdspotId] = useState(false);
  // 编辑的时候，如果创建过三方广告位，就禁用编辑应用ID
  const [disabledMetaAppId, setDisabledMetaAppId] = useState(false);

  /** 1 - 横幅， 2 开屏， 3 插屏， 6 信息流， 8 文字链 ， 9 视频贴片， 12 激励视频 */
  const adspotType = adspot.map[adspotId]?.adspotType || 0;
  const isBdBanner = adspotType == 1 && clickChannel == 4;
  /** 是否正在编辑 创建过三方广告位的广告源 */
  const isEditAutoCreate = !!(isEditing && model && model.isAutoCreate);

  useEffect(() => {
    if(!mediaId) return;
  }, [mediaId]);

  useEffect(() => {
    const newModel = {...model};
    const itemArray = ['deviceRequestInterval', 'dailyReqLimit', 'dailyImpLimit', 'deviceDailyReqLimit', 'deviceDailyImpLimit'];
    const hasValueIndex = itemArray.findIndex(item => !!newModel[item]);
    newModel.switchFcrequency = hasValueIndex !== -1 ? true : false;
    newModel.switchReportApi = true;
    newModel.autoCreateStatus = true;
    newModel.adnId == 99 ? setIsMediaAdx(true) : setIsMediaAdx(false);
    form.setFieldsValue(newModel);
  }, [model, form]);

  useEffect(() => {
    if (visible) {
      if (isEditing) {
        setClickChannel(model.adnId);
      } else {
        setScrollChannelList(sdkChannelState.list);
        if (sdkChannelState.list.length) {
          const data = sdkChannelState.list;
          setClickChannel(data[0].adnId);
        }
      }
    }
  }, [isEditing, visible]);

  useEffect(() => {
    if (visible) {
      closeModal && setCloseModal(false);
    }
  }, [visible, closeModal]);

  useEffect(() => {
    if (visible && clickChannel && adspotId && !isEditing && !sdkChannelState.sdkAutoAdspot) {
      const currnetChannelConfigs = sdkChannelState.map[clickChannel].adnParamsMeta;
      const hasMetaAppKeyIndex = currnetChannelConfigs.findIndex(item => item.metaKey == 'app_key');
      if (currnetChannelConfigs.length) {
        sdkChannelService.getMetaAppId({adspotId, sdkChannelId: clickChannel}).then(res => {
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
    }
  }, [visible, clickChannel, adspotId, isEditing, sdkChannelState,  sdkChannelState.sdkAutoAdspot]);

  useEffect(() => {
    if (visible && isEditing) {
      if (model.params['app_id']) {
        setSavePervMetaAppId(model.params['app_id']);
        setMetaAppIdDisabled(true);
        setIsSeverHasSaveMetaAppId(true);
      }

      if (model.params['app_key']) {
        setSavePervMetaAppKey(model.params['app_key']);
        setMetaAppKeyDisabled(true);
        setIsSeverHasSaveMetaAppKey(true);
      }
    }
  }, [visible, model, isEditing]);

  useEffect(() => {
    if (visible && isEditing) {
      setIsCreateThird(sdkChannelState.sdkAutoAdspot ? true : false);
    }
  }, [visible, isEditing, sdkChannelState.sdkAutoAdspot]);

  useEffect(() => {
    if (visible && isEditing && selectedChannel?.supportAutoCreate && model.isAutoCreate) {
      setDisabledMetaAppId(true);
    }
  }, [visible, isEditing, sdkChannelState.sdkAutoAdspot, selectedChannel ]);

  useEffect(() => {
    if (isEditing) {
      if (model && model.reportApiParam && !model.reportApiParam.id) {
        form.setFieldValue(['reportApiParam', 'name'], undefined);
        selectedChannel?.reportApiParamsMeta.forEach(ele => {
          form.setFieldValue(['reportApiParam', 'channelParams' , ele.metaKey], undefined);
        });
      }
    }
  }, [isEditing, model]);

  useEffect(() => {
    if (isEditing && model) {
      setSelectedChannel(sdkChannelState.map[model.adnId]);
    } else {
      setSelectedChannel(clickChannel ? sdkChannelState.map[clickChannel] : null);
    }
  }, [isEditing, model, sdkChannelState, clickChannel]);

  useEffect(() => {
    if (switchFcrequency !== undefined) {
      if(switchFcrequency) {
        setShowFcrequencySetting(true);
      } else {
        form.setFieldValue('deviceRequestInterval', null);
        form.setFieldValue('dailyReqLimit', null);
        form.setFieldValue('dailyImpLimit', null);
        form.setFieldValue('deviceDailyReqLimit', null);
        form.setFieldValue('deviceDailyImpLimit', null);
        setShowFcrequencySetting(false);
      }
    }
    sdkRightContainer?.clientHeight && setRightContainerHeight(sdkRightContainer?.clientHeight);
  }, [switchFcrequency]);

  useEffect(() => {
    const sdkTopProCard = document.getElementById('sdk-top-pro-card');
    const sdkBottomProCard = document.getElementById('sdk-bottom-pro-card');
    if (clickChannel) {
      if (sdkTopProCard?.clientHeight && sdkBottomProCard?.clientHeight) {
        const data = sdkTopProCard?.clientHeight + sdkBottomProCard?.clientHeight;
        setRightContainerHeight(data);
      }
    }
  }, [clickChannel, selectedChannel, isHasReportApiParams]);

  useEffect(() => {
    if (changeLeftContianerHeight) {
      sdkRightContainer?.clientHeight && setRightContainerHeight(sdkRightContainer?.clientHeight);
      setChangeLeftContianerHeight(false);
    }
  }, [changeLeftContianerHeight]);

  useEffect(() => {
    let channelAlias;
    if (clickChannel) {
      // 只有在新建的时候才使用 【自动命名规则】
      if (!isEditing) {
        const adspotType = distributionState.adspotList.find(item => item.id == adspotId)?.adspotTypeName;
        channelAlias = sdkChannelState.map[clickChannel].adnName + '_' + adspotType + '_';

        if (!isHeadBidding) {
          channelAlias = bidPrice ? channelAlias + bidPrice : channelAlias;
          
        } else {
          channelAlias = channelAlias + 'bidding';
        }
        form.setFieldValue('channelAlias', channelAlias);
      }
    }
  }, [clickChannel, isEditing, isHeadBidding, bidPrice]);

  useEffect(() => {
    if (select) {
      const text: string = select.trim();
      const result = sdkChannelState.list.filter(item => item.adnId.toString().includes(text) || item.channelName?.toString().toLowerCase().includes(text.toLowerCase()));
      setScrollChannelList(result);
    } else {
      setScrollChannelList(sdkChannelState.list);
    }
  }, [select]);

  useEffect(() => {
    // 如果存在有名字的参数
    if (selectedChannel) {
      const hasReportApiParams = selectedChannel?.reportApiParams.findIndex(item => item.name);
      if ( hasReportApiParams !== -1 ) {
        const list = selectedChannel?.reportApiParams.filter(item => item.name);
        setIsHasReportApiParams(true);
        const newReportApiList = list.map(item => {
          return {id: item.id, name: item.name};
        });
        setReportApiList(newReportApiList);
        // 如果 model无值 || model的值已不存在于reportApiParams中，默认选择第一个
        if (model.reportApiParam) {
          const hasModelReportApiId = newReportApiList.findIndex(item => item.id == model.reportApiParam.id);
          if (hasModelReportApiId == -1) {
            if (isEditing) {
              form.setFieldValue('checkedReportApi', undefined);
            } else {
              form.setFieldValue('checkedReportApi', newReportApiList[0].id);
            }
          } else {
            form.setFieldValue('checkedReportApi', model.reportApiParam.id);
          }
        } else {
          !isEditing && form.setFieldValue('checkedReportApi', newReportApiList[0].id);
        }
      } else {
        setIsHasReportApiParams(false);
      }
    } else {
      setIsHasReportApiParams(false);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (visible) {
      const currentChecked = selectedChannel?.reportApiParams.find(item => item.id == checkedReportApi);
      if (currentChecked) {
        setCurrentReportApiParam(currentChecked || defaultReportApiParam);
      }
    }
  }, [visible, selectedChannel, checkedReportApi]);

  // 如果用户选择创建三方广告位，那么代码位ID或广告位ID需要清空禁用；反之没有创建，则正常填写
  useEffect(() => {
    if (visible) {
      if (isCreateThird && selectedChannel?.supportAutoCreate) {
        !isEditing && form.setFieldValue(['channelParams', 'meta_adspot_id'], '');
        if (isEditing) {
          setDisabledMetaAdspotId(true);
        } else {
          setDisabledMetaAdspotId(!!currentReportApiParam.autoCreateStatus || !checkedReportApi);
        }
      } else {
        isCreateThird && setDisabledMetaAdspotId(false);
      }
    }
  }, [visible, isCreateThird, selectedChannel, isEditing, currentReportApiParam, autoCreateStatus]);
  

  useEffect(() => {
    clickChannel && showFcrequencySetting && setShowFcrequencySetting(false);
  }, [clickChannel]);

  if (!mediaId) {
    return <></>;
  }

  // 每次切换排序方式的时候，都要把竞价系数重置为 1
  const changeIsHeadBidding = () => {
    form.setFieldValue('bidRatio', 1);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    const newModel: ISdkAdspotChannel = {
      ...model,
      ...targetingItemDefaultValues,
      ...values
    };

    // 这里如果页面展示的不是antd的form.item时，受控values取不到该字段的值，因此需要手动赋值
    if (!newModel.params['app_id']) {
      if (savePervMetaAppId) {
        newModel.params['app_id'] = savePervMetaAppId;
      }
    }
    if (!newModel.params['app_key']) {
      if (savePervMetaAppKey) {
        newModel.params['app_key'] = savePervMetaAppKey;
      }
    }

    if (isEditing && !newModel.switchFcrequency) {
      newModel.deviceRequestInterval = 0;
      newModel.dailyReqLimit = 0;
      newModel.dailyImpLimit = 0;
      newModel.deviceDailyReqLimit = 0;
      newModel.deviceDailyImpLimit = 0;
    }
    
    // 如果创建过reportApi参数
    if (clickChannel && sdkReportApiChannels.includes(clickChannel)) {
      if (isHasReportApiParams) {
        const currentReportApiParams = selectedChannel?.reportApiParams.filter(ele => ele.id == checkedReportApi);
        // 非三方广告位的广告源账户必填，这里必有值
        if (currentReportApiParams?.length) {
          newModel.reportApiParam = currentReportApiParams[0];
        } else {
          newModel.reportApiParam = {...defaultReportApiParam};
        }
      } else {
        // 如果没有创建过reportApi参数,且报表API按钮 和 自动创建广告源按钮 都关闭了
        if (!newModel.switchReportApi && !newModel.autoCreateStatus) {
          if (isEditAutoCreate) {
            newModel.reportApiParam = {...defaultReportApiParam};
          } else  {
            newModel.reportApiParam.channelParams = {};
            newModel.reportApiParam.status = 0;
            newModel.reportApiParam.autoCreateStatus = 0;
          }
        } else {
          newModel.reportApiParam.status = +switchReportApi;
          newModel.reportApiParam.autoCreateStatus = +autoCreateStatus;
        }
      }
    }

    if (!isEditing) {
      newModel.adnId = clickChannel;
    }
    const source = channelSource[selectedChannel?.adnId || 0];
    
    let sdkAutoAdspot = sdkChannelState.sdkAutoAdspot;
    if (sdkChannelState.sdkAutoAdspot) {
      if ([3, 4].includes(selectedChannel?.adnId || 0)) {
        sdkAutoAdspot = isEditing ? {cpm: sdkChannelState.sdkAutoAdspot?.cpm} : sdkChannelState.sdkAutoAdspot;
      } else if (selectedChannel?.adnId == 2) {
        sdkAutoAdspot = formatYlhPayloadDataFromModal(sdkChannelState.sdkAutoAdspot, adspotType);
      }
    }

    let result;
    if (selectedChannel?.supportAutoCreate && isCreateThird) { // 支持三方创建 && 创建了三方广告位 走新接口
      if (!isEditing) {
        // 当新建的时候，如果在有账户名称且账户打开了自动创建广告源的情况下，填写了三方广告位的表单，然后再切换成另一个账户，这个账户没有开启自动创建广告源，那这个时候提交还是走老接口
        if (newModel.reportApiParam.autoCreateStatus) {
          result = await sdkAdspotChannelDispatchers.autoAdspotSave({ sdkAdspotChannel: formatPayloadDataFromModal(newModel), sdkAutoAdspot, adspotId, adspotType, source });
        } else {
          result = await sdkAdspotChannelDispatchers.save({ sdkAdspotChannel: formatPayloadDataFromModal(newModel), adspotId });
        }
      } else {
        result = await sdkAdspotChannelDispatchers.autoAdspotSave({ sdkAdspotChannel: formatPayloadDataFromModal(newModel), sdkAutoAdspot, adspotId, adspotType, source });
      } 
    } else { // 未创建三方广告位 或 其它广告源 走老接口
      result = await sdkAdspotChannelDispatchers.save({ sdkAdspotChannel: formatPayloadDataFromModal(newModel), adspotId });
    }

    setSubmitLoading(true);
    if (await sdkAdspotChannelDispatchers.save({ sdkAdspotChannel: formatPayloadDataFromModal(newModel),  adspotId })) {
      if (!isEditing) {
        sdkChannelDispatchers.queryAll();
      }
      setSubmitLoading(false);
      cancel(true);
    }
  };

  const afterClose = () => {
    form.resetFields();
    setClickChannel(undefined);
    setCloseModal(true); 
    setChangeLeftContianerHeight(true);
    isCreateThird && setIsCreateThird(false);
    sdkChannelDispatchers.setSdkAutoAdspot(null);
    disabledMetaAdspotId && setDisabledMetaAdspotId(false);
    disabledMetaAppId && setDisabledMetaAppId(false);
  };

  const changeSwitchFcrequency = (status) => {
    status ? setShowFcrequencySetting(true) : setShowFcrequencySetting(false);
  };

  const clickScrollLi = async (adnId) => {
    setClickChannel(adnId);
    await form.setFieldValue(['companyChannelId'], null);
    const excludedFields = ['checkedReportApi', 'channelAlias', 'switchReportApi', 'autoCreateStatus', 'params'];
    const formValues = form.getFieldsValue();
    const params:any[] = [];
    selectedChannel?.adnParamsMeta.forEach(item => params.push(['params', item.metaKey]));
    const resetFormKeys = Object.keys(formValues).filter(item => !excludedFields.includes(item)).concat(params);
    form.resetFields(resetFormKeys);

    if (!adnId) {
      setSelectedChannel(null);
      return;
    }

    setSelectedChannel(sdkChannelState.map[adnId] || null);
    isCreateThird && setIsCreateThird(false);
    isCreateThird && sdkChannelDispatchers.setSdkAutoAdspot(null);

    if ((adnId == 4 && adspotType == 1) || showFcrequencySetting) {
      sdkRightContainer?.clientHeight && setRightContainerHeight(sdkRightContainer?.clientHeight);
    }
  };

  const changeChannelParams = (reportApiStatus, autoCreateStatus) => {
    if (!reportApiStatus && !autoCreateStatus) {
      selectedChannel?.reportApiParamsMeta.forEach(ele => {
        form.setFieldValue(['reportApiParam', 'channelParams' , ele.metaKey], undefined);
      });
    }

    if (!autoCreateStatus) {
      isCreateThird && setIsCreateThird(false);
      sdkChannelState.sdkAutoAdspot && sdkChannelDispatchers.setSdkAutoAdspot(null);
    }
  };

  const clickThirdAdspotBtn = () => {
    // 1.有账户名称出现该按钮，默认已经打开了自动创建广告源：(1)验证是否勾选了账户名称 (2)验证是否填写了应用ID
    if (isHasReportApiParams) {
      form.validateFields([['channelParams', 'meta_app_id'], 'checkedReportApi']).then(res => {
        if (isCreateThird) setThirdModalData(sdkChannelState.sdkAutoAdspot);
        setDrawerFormVisible(true);
      });
    } else {
      // 2.当前无账户名称 验证是否填写了账户名称、params参数、<重要>以及是否勾选了自动创建广告源
      const validateKeys = [['reportApiParam', 'name'], ['channelParams', 'meta_app_id']];
      selectedChannel?.reportApiParamsMeta.forEach(item => validateKeys.push(['reportApiParam', 'channelParams', item.metaKey]));
      form.validateFields(validateKeys).then(() => {
        setCurrentReportApiParam({...currentReportApiParam, name: form.getFieldValue(['reportApiParam', 'name'])});
        if (isCreateThird) setThirdModalData(sdkChannelState.sdkAutoAdspot);
        setDrawerFormVisible(true);
      });
    }
  };

  const handleSdkChannelForm = () => {
    setModalVisible(true);
    setModalData(selectedChannel);
  };

  return (<>
    <Modal
      title={(isEditing ? '编辑' : '添加') + '广告源'}
      open={visible}
      okText="提交"
      cancelText="取消"
      okButtonProps={{loading: submitLoading}}
      width={isEditing ? 663 : 873}
      maskClosable={false}
      keyboard={false}
      onOk={onSubmit}
      onCancel={() => cancel()}
      afterClose={afterClose}
      wrapClassName={[styles['sdk-channel-warp-container'], isEditing ? styles['editing-warp-coniner'] : ''].join(' ')}
    >
      <Form
        form={form}
        labelCol={{ flex: '0 0 100px' }}
        labelWrap={true}
        colon={false}
        initialValues={model}
        className={styles['sdk-adspot-channel-form']}
      >
        {!isEditing ? <div className={styles['left-container']} style={{height: rightContainerHeight + 'px'}}>
          <Form.Item name="select">
            <Input placeholder='搜索广告网络' prefix={<SearchOutlined style={{color: '#d9d9d9'}}/>}/>
          </Form.Item>
          <ul className={styles['scroll-ul']}>
            {
              scrollChannelList?.length ? scrollChannelList.map(channel => (<li onClick={() => clickScrollLi(channel.adnId)} className={clickChannel == channel.adnId ? styles['li-active'] : ''} key={channel.adnId}>
                <Space>
                  <Image src={channelIconMap[channel.adnId]} width={18} height={18} preview={false}/>
                  <Text>{channel.adnName}</Text>
                  {!!channel.supportAutoCreate && <Image src={auto} preview={false}/>}
                </Space>
              </li>)) : <></>
            }
          </ul>
        </div> : <div className={styles['left-container']}>广告网络：{selectedChannel?.adnName}</div>}
        <div className={styles['right-container']}>
          <div id='sdk-right-container'>
            {
              isBdBanner && <Alert message='百度平台不支持自动创建横幅广告位，请手动创建。' type="info" showIcon banner style={{margin: 0}} />
            }
            <ProCard id='sdk-top-pro-card'>
              <Title level={5} className={styles['base-title']}>基础设置</Title>
              <Row gutter={16} wrap={true}>
                {/* 左侧滚动区域被选择后 与 只有穿山甲，优量汇，快手 才显示reportAPi相关 */}
                {clickChannel && [2, 3, 5].includes(clickChannel) ? <>
                  {/* 如果创建过参数就显示select让用户选择，没有的话就需要填写参数 || 如果编辑时是创建过第三方广告位的广告源也显示select */}
                  {(isHasReportApiParams || isEditAutoCreate) ? 
                    <Col span={16}>
                      <Form.Item
                        name='checkedReportApi'
                        label='账户名称'
                        getValueProps={value => ({ value: value || null })}
                        rules={[{ required: isEditAutoCreate ? false : true, message: '请输入' }]}
                      >
                        <Select
                          placeholder={isEditAutoCreate && !currentReportApiParam.autoCreateStatus ? '当前广告源绑定账户已删除' : '请选择'}
                          style={{width: '100%'}}
                          optionFilterProp='label'
                          options={reportApiList?.map((item) => ({ label: item.name, value: item.id }))}
                          disabled={isEditAutoCreate}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <Space>
                                <Button 
                                  type="text" 
                                  icon={<PlusOutlined />} 
                                  onClick={() => handleSdkChannelForm()}
                                  style={{width: '100%'}}
                                >
                                  新增/编辑
                                </Button>
                              </Space>
                            </>
                          )}
                        />
                      </Form.Item>
                    </Col> : 
                    <Col span={16}>
                      <Form.Item
                        name={['reportApiParam', 'name']}
                        label='账户名称'
                        getValueProps={value => ({ value: value || null })}
                        rules={[{ required: true, type: 'string', message: '请输入' }]}
                        getValueFromEvent={e => e.target.value.trim()}
                      >
                        <Input placeholder="请输入"/>
                      </Form.Item>
                    </Col>
                  }
                  {/* 用户没有创建过reportApi参数才显示 && 不是创建过第三方广告位的广告源 */}
                  {!isHasReportApiParams && !model.isAutoCreate &&
                    <>
                      <Col span={16} style={{position: 'relative'}}>
                        <Form.Item
                          name="switchReportApi"
                          label='报表API'
                          tooltip='建议开通报表API权限，数据报表依赖于第三方报表数据'
                          valuePropName="checked"
                        >
                          <Switch onChange={(status) => changeChannelParams(status, autoCreateStatus)} size='small'/>
                        </Form.Item>
                      </Col>
                      {(!isEditing && selectedChannel?.supportAutoCreate && !isBdBanner) ? <Col span={16}>
                        <Form.Item
                          name='autoCreateStatus'
                          label='自动创建广告源'
                          tooltip={clickChannel && selectedChannel?.supportAutoCreate ? autoCreateStatusTipMap[clickChannel] : ''}
                          valuePropName="checked"
                        >
                          <Switch onChange={(status) => changeChannelParams(switchReportApi, status)} size='small'/>
                        </Form.Item>
                        <Button
                          onClick={clickThirdAdspotBtn}
                          className={styles['third-btn']}
                          disabled={!autoCreateStatus}
                        >
                          {isCreateThird || isEditing ? '编辑' : <><PlusOutlined style={{marginRight: 10}}/>创建</>}三方广告位
                        </Button>
                      </Col> : <></>}
                      {(switchReportApi || autoCreateStatus) && <div className={styles['channel-configs']}>
                        {selectedChannel?.reportApiParamsMeta.map((paramMeta) => (
                          <Col span={16} key={paramMeta.metaKey}>
                            <Form.Item
                              name={['reportApiParam', 'channelParams', paramMeta.metaKey]}
                              label={
                                <span className={styles['channel-configs-label']}>{paramMeta.metaName || paramMeta.metaKey.toUpperCase()}</span>
                              }
                              required={!!paramMeta.metaRequired}
                              rules={[{ required: !!paramMeta.metaRequired, message: '请输入' }]}
                              getValueFromEvent={e => e.target.value.trim()}
                            >
                              <TextArea placeholder="请输入" autoSize={{minRows: 1, maxRows: 1}}/>
                            </Form.Item>
                          </Col>
                        ))}
                      </div>}
                    </>
                  }
                </> : <></>}
                <Row style={{marginLeft: '8px', height: '53px'}}>
                  <Col span={16}>
                    <Form.Item
                      name="isHeadBidding"
                      label="排序方式"
                      required={true}
                      className={styles['sdk-channel-bidding']}
                    >
                      <Radio.Group onChange={changeIsHeadBidding}>
                        <Radio.Button value={1}>
                          <Image src={RTB} className={styles['sdk-rtb-image']} preview={false} />
                          实时竞价
                        </Radio.Button>
                        <Radio.Button value={0}>固价</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={4} style={{marginLeft: '0px'}}>
                    <Form.Item
                      name="bidPrice"
                      dependencies={['isHeadBidding']}
                      getValueProps={value => ({ value: value || null })}
                      rules={[
                        { type: 'number', transform: value => +value, message: '价格格式不正确' }
                      ]}
                      getValueFromEvent={e => e.target.value.trim()}
                    >
                      <Input placeholder="请输入" suffix="¥" className={isHeadBidding ? styles['distribution-input-display-none'] : '' }/>
                    </Form.Item>
                  </Col>
                </Row>
                {
                  !!isHeadBidding && (<Col span={16}>
                    <Form.Item
                      name='bidRatio'
                      label='竞价系数'
                      rules={[
                        { pattern: /^[0-9]*\.?\d{0,2}$/, message: '只能为数字,大于0,且最多保留两位小数'},
                        { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                      ]}
                      getValueFromEvent={e => e.target.value.trim()}
                    >
                      <Input placeholder="请输入竞价系数" />
                    </Form.Item>
                  </Col>
                  )
                }
                <div className={styles['channel-configs']}>
                  {
                    selectedChannel?.adnParamsMeta.map((item) => {
                      return (<SelectedChannelConfigs
                        key={item.metaKey}
                        config={item}
                        isSeverHasSaveMetaAppId={isSeverHasSaveMetaAppId}
                        isSeverHasSaveMetaAppKey={isSeverHasSaveMetaAppKey}
                        metaAppIdDisabled={metaAppIdDisabled}
                        savePervMetaAppId={savePervMetaAppId}
                        setMetaAppIdDisabled={(value) => setMetaAppIdDisabled(value)}
                        setSavePervMetaAppId={(value) => setSavePervMetaAppId(value)}
                        metaAppKeyDisabled={metaAppKeyDisabled}
                        savePervMetaAppKey={savePervMetaAppKey}
                        setMetaAppKeyDisabled={(value) => setMetaAppKeyDisabled(value)}
                        setSavePervMetaAppKey={(value) => setSavePervMetaAppKey(value)}
                        disabledMetaAdspotId={disabledMetaAdspotId}
                        disabledMetaAppId={disabledMetaAppId}
                      />);})
                  }
                </div>
                {isMediaAdx ? <></> : <><Col span={16}>
                  <Form.Item
                    name="channelAlias"
                    label="广告源名称"
                    getValueFromEvent={e => e.target.value.trim()}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                </Col>
                {(!isEditing && isHasReportApiParams && selectedChannel?.supportAutoCreate && !isBdBanner) || (isEditing && isHasReportApiParams && model && model.isAutoCreate && !isBdBanner) ? <Col span={16}>
                  <Form.Item
                    name="autoCreateStatus"
                    label="自动创建广告源"
                    tooltip={clickChannel && selectedChannel?.supportAutoCreate ? autoCreateStatusTipMap[clickChannel] : ''}
                  >
                    {/* 当账户被删掉的时候，也要展示 功能未开启 */}
                    {currentReportApiParam.autoCreateStatus && checkedReportApi ? <Button onClick={clickThirdAdspotBtn}>{isCreateThird || isEditing ? '编辑' : <><PlusOutlined style={{marginRight: 10}}/>创建</>}三方广告位</Button> :
                      <Space className={styles['auto-params-space']}>功能未开启<Button type='link' onClick={() => handleSdkChannelForm()}>前往开启</Button></Space>}
                  </Form.Item>
                </Col> : <></>}
                <Col span={16}>
                  <Form.Item
                    name="timeout"
                    label="超时时间"
                    required={true}
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
                    tooltip='单个广告源一次请求最长等待时间，若超过超时时间仍未返回任何广告，则放弃本次请求'
                    getValueFromEvent={e => e.target.value.trim()}
                  >
                    <Input suffix="毫秒" placeholder="请输入" />
                  </Form.Item>
                </Col></>}
              </Row>
            </ProCard>
            <ProCard id='sdk-bottom-pro-card'>
              {isMediaAdx ? <></> : <><Divider className={styles['segment-divider']} />
                <div className={styles['targeting-picker']}>
                  <Title level={5} editable={{editing: false, tooltip: '多个定向规则之间的关系是 【and】，同一个定向规则里的多个定向条件之间的关系是 【or】', icon: <QuestionCircleOutlined style={{color: '#00000073'}}/>}}>定向设置</Title>
                  <TargetingItemsPicker<ISdkAdspotChannel>
                    targetingConfig={targetingItems}
                    model={model}
                    mediumId={mediaId}
                    changeCurrentTargeting={(value) => setChangeLeftContianerHeight && setChangeLeftContianerHeight(true)}
                    closeModal={closeModal}
                  />
                </div>
                <Divider className={styles['segment-divider']} />
                <div className={styles['frequency-setting-container']}>
                  <Title level={5}>
                    频次设置
                    <Form.Item
                      name="switchFcrequency"
                      valuePropName="checked"
                    >
                      <Switch onChange={(status) => changeSwitchFcrequency(status)} size='small'/>
                    </Form.Item>
                  </Title>
                  {showFcrequencySetting && <Row gutter={16}>
                    <Col span={16}>
                      <Form.Item
                        name="deviceRequestInterval"
                        label="单设备最小请求间隔"
                        tooltip='单个设备上次广告展示与下次广告请求之间的时间间隔'
                        getValueProps={(value) => ({value: value || null})}
                        rules={[
                          { type: 'number', transform: value => +value, message: '格式不正确' },
                          { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                        ]}
                        getValueFromEvent={e => e.target.value.trim()}
                      >
                        <Input suffix="秒" placeholder="请输入" />
                      </Form.Item>
                    </Col>
                    <Row>
                      <Col span={8} style={{marginRight: '8px'}}>
                        <Form.Item
                          name="dailyReqLimit"  // 每日请求上限
                          label="每日上限"
                          tooltip='单个广告源一天内可请求/展示的次数上限'
                          getValueProps={(value) => ({value: value || null})}
                          rules={[
                            { type: 'number', transform: value => +value, message: '格式不正确' },
                            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                          ]}
                          getValueFromEvent={e => e.target.value.trim()}
                        >
                          <Input placeholder="不限" prefix='请求'/>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          name="dailyImpLimit"  // 每日曝光上限
                          getValueProps={(value) => ({value: value || null})}
                          rules={[
                            { type: 'number', transform: value => +value, message: '格式不正确' },
                            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                          ]}
                          getValueFromEvent={e => e.target.value.trim()}
                        >
                          <Input placeholder="不限" prefix='曝光'/>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8} style={{marginRight: '8px'}}>
                        <Form.Item
                          name="deviceDailyReqLimit"  // 单设备每日请求上限
                          label="单设备每日上限"
                          tooltip='单个设备一天内可请求到此广告源/可展示此广告源广告的次数上限'
                          getValueProps={(value) => ({value: value || null})}
                          rules={[
                            { type: 'number', transform: value => +value, message: '格式不正确' },
                            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                          ]}
                          getValueFromEvent={e => e.target.value.trim()}
                        >
                          <Input placeholder="不限" prefix='请求'/>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          name="deviceDailyImpLimit" // 单设备每日曝光上限
                          getValueProps={(value) => ({value: value || null})}
                          rules={[
                            { type: 'number', transform: value => +value, message: '格式不正确' },
                            { type: 'number', transform: value => +value, min: 0, message: '应该大于${min}' },
                          ]}
                          getValueFromEvent={e => e.target.value.trim()}
                        >
                          <Input placeholder="不限" prefix='曝光'/>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Row>}
                </div>
              </>}
            </ProCard>
          </div>
        </div>
      </Form>
    </Modal>

    <SdkChannelModalForm
      channel={modalData}
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      onFinish={() => console.log()}
    />

    <SdkAutoAdspot
      channelId={clickChannel || 0}
      drawerFormVisible={drawerFormVisible}
      adspotType={adspotType}
      metaAppId={metaAppId || savePervMetaAppId}
      reportApiName={currentReportApiParam.name}
      channelAlias={channelAlias}
      thirdModalData={thirdModalData}
      isEditThird={isCreateThird}
      isEditAdspotChannel={isEditing}
      isHeadBidding={isHeadBidding}
      onClose={(isSubmit?) => {
        isSubmit && setIsCreateThird(true);
        setDrawerFormVisible(false);
      }}
    />
  </>);
}

export default SdkAdspotChannelForm;

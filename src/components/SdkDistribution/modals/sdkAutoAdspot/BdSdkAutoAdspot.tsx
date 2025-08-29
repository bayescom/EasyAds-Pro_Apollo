import { DrawerForm } from '@ant-design/pro-form';
import styles from './index.module.less';
import { Alert, Checkbox, Col, Form, Input, Radio, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { bdMaterialTypesNameMap, bdAdStyleNameMap, bdAdStyleMap, splashShowControl, infoFlowTemplateKeys, infoFlowTemplateItems, isTimestampToday } from './utils';
import store from '@/store';
import MultipleSelect from '@/components/MultipleSelect';
import { adspotTypeListMap } from '@/components/Utils/Constant';
import { BasicOption } from '@/models/types/common';
import { formatBdPayloadDataFromModal } from './utils/formatBdSdkAutoAdspot';
import { convertNumbersToStrings } from '@/services/utils/utils';
import { getCurrentDateTimeFormatted } from '@/services/utils/utils';

type Iprops = {
  drawerFormVisible: boolean,
  adspotType: number,
  metaAppId: string,
  reportApiName: string,
  channelAlias: string | undefined,
  thirdModalData?: Record<string, any> | null,
  isEditThird: boolean,
  isEditAdspotChannel: boolean,
  isHeadBidding: number,
  onClose: (isSubmit?: boolean) => void
}

const sdkChannelDispatcher = store.getModelDispatchers('sdkChannel');

export default function BdSdkAutoAdspot({
  drawerFormVisible,
  adspotType,
  metaAppId,
  reportApiName,
  channelAlias,
  thirdModalData,
  isEditThird,
  isEditAdspotChannel,
  isHeadBidding,
  onClose
}: Iprops) {
  const sdkChannelState = store.useModelState('sdkChannel');

  const [form] = Form.useForm();
  // 信息流 渲染样式
  const infoFlowStyleControlType = Form.useWatch('infoFlowStyleControlType', form);
  //       物料类型
  const infoFlowMaterialTypes = Form.useWatch('infoFlowMaterialTypes', form);

  // 插屏 广告场景
  const interstitialAdScene = Form.useWatch('interstitialAdScene', form);
  // 激励视频 回调控制
  const rewardVideoReturnControl = Form.useWatch('rewardVideoReturnControl', form);

  const [isDisabledCpm, setIsDisabledCpm] = useState(false);

  const [adStyleOption, setAdStyleOption] = useState<BasicOption<string>[]>([]);
  const [infoFlowTemplateOption, setInfoFlowTemplateOption] = useState<BasicOption<string>[]>([]);
  
  const initialValues = {
    adspotTypeName: adspotTypeListMap[adspotType],
    // 物料类型
    splashMaterialTypes: [1, 7],
    infoFlowMaterialTypes: [1, 7],
    interstitialMaterialTypes: [1, 7],
    splashShowControl: 2,
    interstitialAdScene: 1,
    infoFlowTemplates: ['14', '16', '18', '19', '21', '30'],
    rewardVideoReturnControl: 0,
    rewardVideoVoiceControl: 0,
    infoFlowStyleControlType: 1,
    interstitialStyleTypes: ['1', '2', '4']
  };

  useEffect(() => {
    if (drawerFormVisible) {
      form.setFieldValue('metaAppId', metaAppId);
    }
  }, [drawerFormVisible, metaAppId]);

  useEffect(() => {
    if (drawerFormVisible) {
      form.setFieldValue('reportApiName', reportApiName);
    }
  }, [reportApiName, drawerFormVisible]);

  useEffect(() => {
    // 首次打开默认填入广告源名称
    if (drawerFormVisible && !isEditAdspotChannel && !isEditThird) {
      form.setFieldValue('adName', channelAlias + '_' + getCurrentDateTimeFormatted());
    }
  }, [channelAlias, drawerFormVisible, isEditAdspotChannel, isEditThird]);

  useEffect(() => {
    if (drawerFormVisible) {
      let values;
      const modaleData = {...form.getFieldsValue, ...thirdModalData, ...thirdModalData?.adInfo, adspotTypeName: adspotTypeListMap[adspotType]};
      // 创建广告源时 的 编辑三方广告位
      if (isEditThird && !isEditAdspotChannel) {
        const supplementData = {};
        for(const key in modaleData) {
          if (key == 'interstitialStyleTypes') {
            supplementData[key] = convertNumbersToStrings(modaleData[key]);
          }

          if (key == 'infoFlowTemplates' && modaleData.infoFlowTemplates) {
            supplementData[key] = convertNumbersToStrings(modaleData[key]).filter(item => !['17', '20'].includes(item));
          }

          if (key == 'infoFlowElement' && modaleData.infoFlowStyleControlType == 3 && modaleData.infoFlowElement.elementGroups) {
            supplementData[key] = convertNumbersToStrings(modaleData.infoFlowElement.elementGroups);
          }
        }
        
        values = { ...modaleData, ...supplementData };
      } else if (isEditThird && isEditAdspotChannel) { // 编辑广告源
        values = modaleData;
      } else {
        values = initialValues;
      }

      form.setFieldsValue(values);
    }
  }, [drawerFormVisible, thirdModalData, adspotType, isEditAdspotChannel]);

  // 广告样式
  useEffect(() => {
    if (drawerFormVisible){
      // 插屏 依赖interstitialAdScene的值, 信息流 依赖infoFlowStyleControlType的值
      if (adspotType == 4 && interstitialAdScene) {
        setAdStyleOption(bdAdStyleMap[interstitialAdScene]);
      }

      if (adspotType == 2 && infoFlowStyleControlType) {
        setAdStyleOption(bdAdStyleMap[infoFlowStyleControlType]);
      }
    }
  }, [drawerFormVisible, interstitialAdScene, infoFlowStyleControlType, adspotType]);

  // 模版样式
  useEffect(() => {
    if (drawerFormVisible && adspotType == 2 && infoFlowStyleControlType == 1) {
      if (infoFlowMaterialTypes && infoFlowMaterialTypes.length) {
        const key = infoFlowMaterialTypes.length == 2 ? 'checkAll' : infoFlowMaterialTypes.toString();
        const list = infoFlowTemplateKeys[key].map(item => infoFlowTemplateItems[item]);
        setInfoFlowTemplateOption(list);
      } else {
        setInfoFlowTemplateOption([]);
      }
    }
  }, [drawerFormVisible, infoFlowMaterialTypes, adspotType, infoFlowStyleControlType]);

  // cpm：竞价 1，固价 0， 竞价不可以编辑，固价可以编辑
  useEffect(() => {
    if (drawerFormVisible && isEditAdspotChannel) {
      // 1. 如果提交的时候选了不设置，编辑广告源的时候就不能重新设置
      if (!sdkChannelState.sdkAutoAdspot?.cpm) {
        setIsDisabledCpm(true);
      } else {
        setIsDisabledCpm(false);
      }

      // 2. 每天（0-24小时内）只能编辑一次cpm
      if (sdkChannelState.cpmUpdateTime) {
        if (!isTimestampToday(sdkChannelState.cpmUpdateTime)) {
          setIsDisabledCpm(false);
        } else {
          setIsDisabledCpm(true);
        }
      }
    }
  }, [isEditAdspotChannel, drawerFormVisible]);

  const handleSubmit = (values) => {
    sdkChannelDispatcher.setSdkAutoAdspot(formatBdPayloadDataFromModal(values, adspotType));
    onClose(true);
  };

  const handleInfoFlowStyleControlType = (value) => {
    if (value == 1) {
      !infoFlowMaterialTypes && form.setFieldValue('infoFlowMaterialTypes', [1, 7]);
      form.setFieldValue('infoFlowTemplates', ['14', '16', '18', '19', '21', '30']);
    }

    if (value == 3) {
      form.setFieldValue('infoFlowElement', ['1']);
    }
  };

  const handleInterstitialAdScene = (value) => {
    form.setFieldValue('interstitialStyleTypes', value == 1 ? ['1', '2', '4'] : ['3']);
  };

  const handleInfoFlowMaterialTypes = (checked) => {
    if (adspotType == 2) {
      if (checked.toString() == '7') {
        form.setFieldValue('infoFlowTemplates', infoFlowTemplateKeys['7']);
      }

      if (checked.length == 2 || checked.toString() == '1') {
        form.setFieldValue('infoFlowTemplates', infoFlowTemplateKeys['checkAll']);
      }

      if (!checked.length) {
        form.setFieldValue('infoFlowTemplates', undefined);
      }
    }
  };
  
  // 系统内常用类型： /** 1 - 开屏， 2 信息流， 3 横幅， 4 插屏， 5 激励视频 */
  // 百度三方创建支持广告位类型：开屏、插屏、信息流、激励视频
  // 编辑广告源-编辑三方广告位-只能编辑期待ecpm，其它字段禁用
  return (<DrawerForm
    open={drawerFormVisible}
    onFinish={handleSubmit}
    title={`${isEditThird || isEditAdspotChannel ? '编辑' : '创建'}三方广告位`}
    form={form}
    labelCol={{ flex: '0 0 160px' }}
    width={670}
    labelWrap={true}
    layout="horizontal"
    drawerProps={{
      maskClosable: false,
      className: `${styles['csj-drawer-modal']} ${styles['third-adspot-modal']}`,
      onClose: () => onClose(),
      placement: 'right',
      destroyOnClose: true
    }}
    submitter={{ searchConfig: { submitText: '提交' } }}
  >
    <Alert
      className={styles['adspot-api-channel-alert']}
      message='自动创建广告源将使用默认参数创建三方广告位，此处不提供修改的参数需要到三方后台修改'
      type="info"
      showIcon
      banner
    />
    <Row wrap={true}>
      <Col span={21}>
        <Form.Item
          name='reportApiName'
          label='账户名称'
        >
          <Input bordered={false} disabled/>
        </Form.Item>
      </Col>
      <Col span={21}>
        <Form.Item
          name='metaAppId'
          label='应用ID'
        >
          <Input bordered={false} disabled/>
        </Form.Item>
      </Col>
      <Col span={21}>
        <Form.Item
          name='cpm'
          label='期望CPM'
          tooltip='排序方式选择【固价】时可编辑期望CPM；设置期望CPM后，填充率和收入将会受影响；每天只可设置1次期望CPM。'
          required
          rules={[
            {
              validator: (_, value) => {
                if (isHeadBidding) {
                  return Promise.resolve();
                } 
                if (!value){
                  return Promise.reject('请输入期望的CPM');
                } else if (!/^\d/.test(value)) {
                  return Promise.reject('必须为数字,且是数字开头');
                } else if ((!/^[0-9]*\.?\d{0,2}$/.test(value)) || value < 0 || value > 10000){
                  return Promise.reject('价格必须在0~10000之间,最多两位小数');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input suffix='¥' disabled={!!isHeadBidding || isDisabledCpm} placeholder='请输入0~10000之间的数值' />
        </Form.Item>
      </Col>
      <Col span={21}>
        <Form.Item
          name="adName"
          label="广告位名称"
          getValueFromEvent={e => e.target.value.trim()}
          rules={[{required: true, message: '请输入广告位名称'}]}
        >
          <Input placeholder="请输入" disabled={isEditAdspotChannel}/>
        </Form.Item>
      </Col>
      <Col span={21}>
        <Form.Item
          name='adspotTypeName'
          label='广告位类型'
        >
          <Input bordered={false} disabled/>
        </Form.Item>
      </Col>

      {/* 信息流 显示渲染样式 */}
      {adspotType == 2 && <Col span={21}>
        <Form.Item
          name='infoFlowStyleControlType'
          label='渲染样式'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel} onChange={(e) => handleInfoFlowStyleControlType(e.target.value)}>
            <Radio.Button value={1}>优选模版</Radio.Button>
            <Radio.Button value={2}>自渲染</Radio.Button>
            <Radio.Button value={3}>返回元素</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 开屏、插屏、（信息流 && 渲染样式是优选模版）才有物料类型 */}
      {(adspotType == 1 || adspotType == 4 || adspotType == 2 &&  infoFlowStyleControlType == 1) && <Col span={21}>
        <Form.Item
          label="物料类型"
          // 信息流：infoFlowMaterialTypes  开屏：splashMaterialTypes  插屏：interstitialMaterialTypes
          name={bdMaterialTypesNameMap[adspotType]}
          rules={[{ required: true, message: '请选择物料类型'}]}
        >
          <Checkbox.Group disabled={isEditAdspotChannel} onChange={(checked) => handleInfoFlowMaterialTypes(checked)}>
            <Checkbox key={1} value={1}>图片</Checkbox>
            <Checkbox key={7} value={7}>视频</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Col>}
      {/* 开屏 显示展示控制 */}
      {adspotType == 1 && <Col span={21}>
        <Form.Item
          label='展示控制'
          name='splashShowControl'
          required
          initialValue={2}
          rules={[{ required: true, message: '请选择展示控制' }]}
        >
          <Select options={splashShowControl} disabled={isEditAdspotChannel}/>
        </Form.Item>
      </Col>}
      {/* 插屏 显示广告场景 */}
      {adspotType == 4 && <Col span={21}>
        <Form.Item
          name='interstitialAdScene'
          label='广告场景'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel} onChange={(e) => handleInterstitialAdScene(e.target.value)}>
            <Radio.Button value={1}>竖版</Radio.Button>
            <Radio.Button value={2}>横版</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 插屏、（信息流 && 渲染样式是返回元素）显示广告样式 */}
      {(adspotType == 4 || adspotType == 2 && infoFlowStyleControlType == 3) &&  <Col span={21}>
        <MultipleSelect 
          options={adStyleOption}
          label={adspotType == 2 ? '组成元素' : '广告样式'}
          // 插屏：interstitialStyleTypes  信息流：infoFlowElement
          name={bdAdStyleNameMap[adspotType]}
          keyType='value'
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
          rules={[{ required: true, message: '请选择广告样式' }]}
        />
      </Col>}
      {/* 信息流 && 渲染样式是优选模版 显示模版样式 */}
      {adspotType == 2 && infoFlowStyleControlType == 1 && <Col span={21}>
        <MultipleSelect 
          options={infoFlowTemplateOption}
          label='模版样式'
          name='infoFlowTemplates'
          keyType='value'
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
          rules={[{ required: true, message: '请选择模版样式' }]}
        />
      </Col>}
      {/* 激励视频 显示回调控制 */}
      {adspotType == 5 && <><Col span={21}>
        <Form.Item
          name='rewardVideoReturnControl'
          label='回调控制'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={0}>无需服务器判断</Radio.Button>
            <Radio.Button value={1}>需要服务器判断</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 回调控制选择需要服务器判断 才显示回调URL */}
      {rewardVideoReturnControl == 1 && <Row className={styles['inline-row']}>
        <Col span={12}>
          <Form.Item
            name='rewardVideoReturnUrl'
            rules={[
              { required: true, message: '请输入回调URL' },
              {
                pattern: /^(http|https):\/\/.*\..*\/.*$/,
                message: 'URL必须以http:// 或https://开头、并中间携带 . 和 /',
              },
            ]}
          >
            <Input placeholder='请输入回调URL' disabled={isEditAdspotChannel}/>
          </Form.Item>
        </Col>
      </Row>}
      {/* 激励视频 显示声音控制 */}
      <Col span={21}>
        <Form.Item
          name='rewardVideoVoiceControl'
          label='声音控制'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={0}>声音外放</Radio.Button>
            <Radio.Button value={1}>静音</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col></>}
    </Row>
  </DrawerForm>);
}

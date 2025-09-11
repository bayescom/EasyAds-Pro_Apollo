import { DrawerForm } from '@ant-design/pro-form';
import styles from './index.module.less';
import { Alert, Col, Form, Input, Radio, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { isTimestampToday, ksBannerTempalteId, ksMaterialTypeList, ksMultiTemplateParamsMap, ksRewardedTypeList } from './utils';
import store from '@/store';
import { formatKsPayloadDataFromModal, formatmaterialTypeListFormBackend, formatSplashMaterialTypeListFormBackend } from './utils/formatKsSdkAutoAdspot';
import MultipleSelect from '@/components/MultipleSelect';
import { adspotTypeListMap } from '@/components/Utils/Constant';
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

export default function KsSdkAutoAdspot({
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

  // 激励视频：是否需要服务器判断
  const callbackStatus = Form.useWatch('callbackStatus', form);
  // 素材类型
  const materialTypeList = Form.useWatch('materialTypeList', form);
  const renderType = Form.useWatch('renderType', form);

  // 不能只用广告位类型来判断，因为插屏还区分 新插屏（23）和插屏 （13）
  const adStyle = Form.useWatch('adStyle', form);

  const [isDisabledCpm, setIsDisabledCpm] = useState(false);

  const getMaterialTypeDefaultValue = (adspotType, renderType) => {
    let materialType = 1;
    switch(adspotType){
    case 3:
    case 2:
      if (renderType == 2) {
        materialType = 1;
      } else if(renderType == 1) {
        materialType = ksMaterialTypeList.map(item => item.value);
      }
      
      break;
    case 1:
    case 5:
      materialType = 1;
      break;
    case 4:
      materialType = ksMaterialTypeList.filter((_, index) => index < 4).map(item => item.value);
      break;
    default:
      materialType = 1;
    }

    return materialType;
  };
  const initialValues = {
    adspotTypeName: adspotTypeListMap[adspotType],
    renderType: adspotType == 5 ? 1 : 2,
    // 广告位类型 （插屏的时候用到，默认为新插屏）
    adStyle: 23,
    // 图片+视频 1， 仅视频2，仅图片3
    // 素材类型：banner 和 信息流（模板渲染2）默认值1
    // 屏幕方向: 开屏 或 激励视频 出现 默认值 2
    // 素材类型: 插屏 + 新插屏出现 默认 ksMaterialTypeList 全选
    materialTypeList: getMaterialTypeDefaultValue(adspotType, renderType),
    // 广告样式: banner + 模板渲染（2）显示 
    templateId: 101,
    // 开屏: 跳过按钮
    skipAdMode: 0,
    // 开屏: 跳过按钮是否显示倒计时
    countdownShow: 1,
    // 新插屏出现 广告铺开大小
    adRolloutSize: 1,
    // 信息流 + 模板渲染的时候出现模板样式
    multiTemplateParams: adspotType == 2 ? ksMultiTemplateParamsMap[getMaterialTypeDefaultValue(adspotType, renderType)] ? ksMultiTemplateParamsMap[getMaterialTypeDefaultValue(adspotType, renderType)].map(item => item.value) : [] : null,
    
    // 激励视频 奖励名称
    rewardedType: 1,
    // 奖励数量
    callbackStatus: 0
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
      form.setFieldValue('name', channelAlias + '_' + getCurrentDateTimeFormatted());
    }
  }, [channelAlias, drawerFormVisible, isEditAdspotChannel, isEditThird]);

  useEffect(() => {
    if (drawerFormVisible) {
      let values;
      const modalData = {...form.getFieldsValue, ...thirdModalData, adspotTypeName: adspotTypeListMap[adspotType]};
      // 创建广告源时 的 编辑三方广告位
      if (isEditThird && !isEditAdspotChannel) {
        const supplementData = {};
        for(const key in modalData) {
          if (key == 'materialTypeList' && ((adspotType == 3 || (adspotType == 2 && modalData['renderType'] != 1)))) {
            supplementData[key] = formatmaterialTypeListFormBackend(modalData[key]);
          } else if (key == 'materialTypeList' && adspotType == 1) {
            supplementData[key] = formatSplashMaterialTypeListFormBackend(modalData[key]);
          } else if (key == 'multiTemplateParams' && (adspotType == 2 && modalData['renderType'] != 1)) {
            supplementData[key] = modalData[key].map(item => (item.templateId));
          }
        }
        values = { ...modalData, ...supplementData };
      } else if (isEditThird && isEditAdspotChannel) { // 编辑广告源
        values = modalData;
      } else {
        values = initialValues;
      }

      form.setFieldsValue(values);
    }
  }, [drawerFormVisible, thirdModalData, adspotType, isEditAdspotChannel]);

  // cpm：竞价 1，固价 0， 竞价不可以编辑，固价可以编辑
  useEffect(() => {
    if (drawerFormVisible && isEditAdspotChannel) {
      // 1. 如果提交的时候选了不设置，编辑广告源的时候就不能重新设置
      if (!sdkChannelState.sdkAutoAdspot?.ecpmPrice) {
        setIsDisabledCpm(true);
      } else {
        setIsDisabledCpm(false);
      }

      // 2. 24小时内只能编辑一次cpm
      if (sdkChannelState.cpmUpdateTime) {
        if (!isTimestampToday(sdkChannelState.cpmUpdateTime)) {
          setIsDisabledCpm(false);
        } else {
          setIsDisabledCpm(true);
        }
      } else {
        setIsDisabledCpm(false);
      }
    }
  }, [isEditAdspotChannel, drawerFormVisible]);

  const changeRenderType = (e) => {
    // 自渲染
    if (e.target.value == 1) {
      form.setFieldValue('materialTypeList', ksMaterialTypeList.map(item => item.value));
    } else {
      form.setFieldValue('materialTypeList', 1);
    }
  };

  const changeMaterialTypeList = (e) => {
    if (adspotType == 2) {
      form.setFieldValue('multiTemplateParams', ksMultiTemplateParamsMap[e.target.value].map(item => item.value));
    }
  };

  const handleSubmit = (values) => {
    sdkChannelDispatcher.setSdkAutoAdspot(formatKsPayloadDataFromModal(values, adspotType));
    onClose(true);
  };
  
  // 系统内常用类型： /** 1 - 开屏， 2 信息流， 3 横幅， 4 插屏， 5 激励视频 */
  // 穿山甲三方创建支持广告位类型：开屏、横幅、激励视频、信息流、插屏
  // 编辑广告源-编辑三方广告位-只能编辑期待cpm，其它字段禁用
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
      className: `${styles['csj-drawer-modal']} ${styles['third-adspot-modal']}  ${styles['ylh-auto-adspot']}`,
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
      {/* common 开始: 账户名称、应用ID、目标ecpm、广告位名称、广告位类型 */}
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
      <Row style={{width: '100%'}}>
        <Col span={21}>
          <Form.Item
            name='expectCpm'
            label='目标eCPM'
            tooltip='排序方式选择【固价】时可编辑目标eCPM；设置目标eCPM后，填充率和收入将会受影响；每天只可设置1次目标eCPM。'
            required
            rules={[
              {
                validator: (_, value) => {
                  if (isHeadBidding) {
                    return Promise.resolve();
                  } 
                  if (!value){
                    return Promise.reject('请输入期望的CPM');
                  }
                  if (!/^[0-9]*[1-9][0-9]*$/.test(value)){
                    return Promise.reject('期望的CPM只能是正整数');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input suffix='¥' disabled={!!isHeadBidding || isDisabledCpm} placeholder='请输入整数，单位元' />
          </Form.Item>
        </Col>
        
      </Row>
      <Col span={21}>
        <Form.Item
          name="name"
          label="广告位名称"
          getValueFromEvent={e => e.target.value.trim()}
          rules={[{
            required: true,
            message: '请填写广告位名称',
          }]}
        >
          <Input placeholder="请输入" disabled={isEditAdspotChannel}/>
        </Form.Item>
      </Col>
      {
        [3,1,2,5].includes(adspotType) ? <><Col span={21}>
          <Form.Item
            name='adspotTypeName'
            label='广告位类型'
          >
            <Input bordered={false} disabled/>
          </Form.Item>
        </Col></> : <Col span={21}>
          <Form.Item
            name='adStyle'
            label='广告位类型'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel} defaultValue={23}>
              <Radio.Button value={23}>新插屏</Radio.Button>
              <Radio.Button value={13}>插屏</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      }
      {/* 这里。不同的类型对应的不同，banner 有且只有2（模板渲染），信息流可选（1-自渲染
2-模版渲染），激励视屏有且只有1，是模板渲染，插屏有且只有2（模板渲染），开屏有且只有2（模板渲染），新插屏有且只有2（模板渲染） */}
      {
        <Col span={21}>
          <Form.Item
            name='renderType'
            label='渲染方式'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel} defaultValue={1} onChange={changeRenderType}>
              <Radio.Button value={adspotType == 5 ? 1 : 2}>模板渲染</Radio.Button>
              {
                adspotType == 2 ? <Radio.Button value={1}>自渲染</Radio.Button> : <></>
              }
            </Radio.Group>
          </Form.Item>
        </Col>
      }

      {/* common 结束 */}
      
      {/* banner + 模板渲染（2）出现 素材类型， */} 
      {/* 信息流 + 模板渲染（2）出现 素材类型， */}
      {/* 注意：传给后端的时候，视频+图片传【1，2，5，6】，仅图片传【5，6】，仅视频传【1，2】 */}
      {
        adspotType == 3 || (adspotType == 2 && renderType == 2) ? <Col span={21}>
          <Form.Item
            name='materialTypeList'
            label='素材类型'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel} onChange={changeMaterialTypeList}>
              <Radio.Button value={1}>视频+图片</Radio.Button>
              <Radio.Button value={2}>仅视频</Radio.Button>
              <Radio.Button value={3}>仅图片</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col> : <></>
      }

      {/* banner + 模板渲染（2）显示 广告样式  */}
      {[3].includes(adspotType) ? <Col span={21}>
        <Form.Item
          label="广告样式"
          name="templateId"
          required={true}
          rules={[{
            required: true,
            message: '请选择广告样式',
          }]}
        >
          <Select options={ksBannerTempalteId} disabled={isEditAdspotChannel}/>
        </Form.Item>
      </Col> : <></>
      }

      {/* 开屏 + 模板渲染（2）出现屏幕方向 */}
      {/* 激励视频 + 模板渲染（1）出现屏幕方向 */}
      {/* 竖屏：[1,3] 横屏： 必填[2,6] */}
      {
        adspotType == 1 ? <Col span={21}>
          <Form.Item
            name='materialTypeList'
            label='屏幕方向'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel}>
              <Radio.Button value={1}>竖屏</Radio.Button>
              <Radio.Button value={2}>横屏</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col> : <></>
      }
      {
        adspotType == 5 ? <Col span={21}>
          <Form.Item
            name='materialTypeList'
            label='屏幕方向'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel}>
              <Radio.Button value={1}>竖屏</Radio.Button>
              <Radio.Button value={2}>横屏</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col> : <></>
      }

      {/* 开屏 跳过按钮 和 跳过按钮是否显示倒计时 */}
      {   
        (adspotType == 1) ? <>
          <Col span={21}>
            <Form.Item
              name='skipAdMode'
              label='跳过按钮'
              required
            >
              <Radio.Group disabled={isEditAdspotChannel} defaultValue={0}>
                <Radio.Button value={0}>显示</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={21}>
            <Form.Item
              name='countdownShow'
              label='跳过按钮是否显示倒计时'
              required
            >
              <Radio.Group disabled={isEditAdspotChannel} defaultValue={1}>
                <Radio.Button value={1}>显示</Radio.Button>
                <Radio.Button value={0}>不显示</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </> : <></>
      }

      {/* 插屏 + 新插屏出现 素材类型 */}
      {adspotType == 4 || (adspotType == 2 && renderType == 1) ? <Col span={21}>
        <MultipleSelect 
          options={adspotType == 4 ? ksMaterialTypeList.filter((_, index) => index < 4) : ksMaterialTypeList}
          label='素材类型'
          name='materialTypeList'
          keyType='value'
          rules={[{ required: true, message: '请选择素材类型' }]}
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
        />
      </Col>: <></>}
      {/* 广告铺开大小 1-全屏， 2-半屏， 3-优选 插屏的时候没有这个字段 */}
      {
        adspotType == 4 && adStyle == 23 ? <Col span={21}>
          <Form.Item
            name='adRolloutSize'
            label='广告铺开大小'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel} defaultValue={1}>
              <Radio.Button value={1}>全屏</Radio.Button>
              <Radio.Button value={2}>半屏</Radio.Button>
              <Radio.Button value={3}>优选</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>: <></>
      }

      {/* 信息流 + 模板渲染的时候出现模板样式 */}
      {/* 素材类型为视频+图片、仅图片时，以下11项都可选，并默认全选 */}
      {/* 仅视频：只能选择上文下图（横版），上图下文（横版），大图（横版）、上文下图（竖版），上图下文（竖版），大图（竖版）  */}
      {adspotType == 2 && renderType == 2 ? <Col span={21}>
        <MultipleSelect 
          options={ksMultiTemplateParamsMap[materialTypeList] || []}
          label='模板样式'
          name='multiTemplateParams'
          keyType='value'
          rules={[{ required: true, message: '请选择模板样式' }]}
          isValueTypeArray={true}
          isValueSectionShown={true}
          valueSectionKey='tips'
          disabled={isEditAdspotChannel}
        />
      </Col>: <></>}

      {/* 激励视频 显示奖励发放设置和服务器判断*/}
      {adspotType == 5 && <><Col span={21}>
        <Form.Item
          name='rewardedType'
          label='奖励名称'
          required
        >
          <Select options={ksRewardedTypeList} disabled={isEditAdspotChannel}/>
        </Form.Item>  
      </Col>
      <Col span={21}>
        <Form.Item
          name='rewardedNum'
          label='奖励数量'
          required
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject('请填写奖励数量');
                }
                if (!/^[0-9]*[1-9][0-9]*$/.test(value)){
                  return Promise.reject('奖励数量只能是正整数');
                }
                return Promise.resolve();
              },
            },
          ]}
          getValueFromEvent={e => e.target.value.trim()}
        >
          <Input placeholder="请输入" disabled={isEditAdspotChannel}/>
        </Form.Item>  
      </Col>
      <Col span={21}>
        <Form.Item
          name='callbackStatus'
          label='服务器判断'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel} defaultValue={0}>
            <Radio.Button value={0}>无需服务器判断</Radio.Button>
            <Radio.Button value={1}>需要服务器判断</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 服务器判断选择需要服务器判断 才显示回调URL */}
      {callbackStatus == 1 && 
        <Col span={21}>
          <Form.Item
            name='callbackUrl'
            label="回调URL"
            rules={[
              { required: true, message: '请输入回调URL' },
              {
                pattern: /^https?:\/\//,
                message: 'URL必须以http://或https://开头',
              },
            ]}
          >
            <Input placeholder='请输入回调URL' disabled={isEditAdspotChannel}/>
          </Form.Item>
        </Col>}</>}
    </Row>
  </DrawerForm>);
}

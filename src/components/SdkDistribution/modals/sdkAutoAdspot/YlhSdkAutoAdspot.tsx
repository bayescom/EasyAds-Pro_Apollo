import { DrawerForm } from '@ant-design/pro-form';
import styles from './index.module.less';
import { Alert, Col, Form, Input, Radio, Row, Select, Checkbox, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { isTimestampToday } from './utils';
import store from '@/store';
import MultipleSelect from '@/components/MultipleSelect';
import { adspotTypeListMap } from '@/components/Utils/Constant';
import  { ylhIncentiveRewardedVideoCrtType, ylhAdCrtTypeMap, ylhAdCrtNormalTypesMap, ylhAdCrtTypeListMap } from './utils/index';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { generateRandomString } from '@/services/utils/utils';
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

export default function YlhSdkAutoAdspot({
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
  const needServerVerify = Form.useWatch('needServerVerify', form);
  // 插屏：渲染样式
  const adCrtTemplateType = Form.useWatch('adCrtTemplateType', form);
  // 横幅 + 信息流 有渲染方式
  const renderType = Form.useWatch('renderType', form);

  const priceType = Form.useWatch('priceType', form);

  const [isDisabledCpm, setIsDisabledCpm] = useState(false);
  
  const initialValues = {
    adspotTypeName: adspotTypeListMap[adspotType],
    needServerVerify: 'NotNeedServerVerify',
    renderType: 'TEMPLATE',
    // 激励视频：渲染样式
    rewardedVideoCrtType: ['VIDEO', 'IMAGE'],
    // 插屏： 广告样式多样性探索
    enableExperiment: 'Open',
    // 广告素材类型
    adCrtTypeList: [1, 4, 2].includes(adspotType) ? ylhAdCrtTypeMap[adspotType].map(item => item.value) : [],
    // 横幅 、信息流：模板渲染时,出现模板样式
    // 插屏这个字段叫 渲染样式
    adCrtTemplateType: adspotType == 3 ? 'BANNER_DP' : adspotType == 2 ? ylhAdCrtTypeListMap[adspotType].map(item => item.value) : adspotType == 4 ? 'INLINE_VHS' : '',
    // 横幅、信息流： 自渲染时，出现自渲染广告样式
    adCrtNormalTypes: adspotType == 3 ?  ylhAdCrtNormalTypesMap[adspotType].map(item => item.value) : adspotType == 3 ? ylhAdCrtNormalTypesMap[adspotType].filter(item => item.isDefaultSelected).map(item => item.value) : '',
    secret: '',
    priceType: isHeadBidding ? '1' : '3'
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
      form.setFieldValue('placementName', channelAlias + '_' + getCurrentDateTimeFormatted());
    }
  }, [channelAlias, drawerFormVisible, isEditAdspotChannel, isEditThird]);

  useEffect(() => {
    if (drawerFormVisible) {
      if (isEditThird) {
        const editModalData = {};
        for(const key in thirdModalData) {
          // 账户名称、应用ID永远以广告源为准
          if (!['metaAppId', 'reportApiName'].includes(key)) {
            // 这里是序列化一下
            // 如果是 1 - 横幅，那么 adCrtTemplateType 这个字段是 图文组合：["BANNER_DP"] 是数组的形式，要转为字符串，因为前端展示的是 radio
            if (key == 'adCrtTemplateType' && [3, 4].includes(adspotType)) {
              editModalData['adCrtTemplateType'] = thirdModalData['adCrtTemplateType'] ? thirdModalData['adCrtTemplateType'] : null;
            } else if (key == 'rewardedVideoCrtType' && adspotType == 5 && thirdModalData['rewardedVideoCrtType'] == 'ALL_DIRECTION') {
              editModalData['rewardedVideoCrtType'] = ['VIDEO', 'IMAGE'];
            } else if (key == 'secret' && !isEditAdspotChannel) {
              editModalData['secret'] = null;
            } else {
              editModalData[key] = thirdModalData[key];
            }
          }
        }
        
        form.setFieldsValue({ ...form.getFieldsValue, ...editModalData, adspotTypeName: adspotTypeListMap[adspotType] });
      } else {
        form.setFieldsValue(initialValues);
      }
    }
  }, [drawerFormVisible, thirdModalData, adspotType]);

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
      }
    }
  }, [isEditAdspotChannel, drawerFormVisible]);

  useEffect(() => {
    if (isHeadBidding) {
      form.setFieldValue('priceType', '1');
    } else {
      form.setFieldValue('priceType', '3');
    }
  }, [isHeadBidding]);

  const changeRenderType = (e) => {
    if (adspotType == 3) {
      if (e.target.value == 'NORMAL') {
        form.setFieldValue('adCrtNormalTypes', ylhAdCrtNormalTypesMap[adspotType].map(item => item.value));
      } else {
        form.setFieldValue('adCrtTemplateType', 'BANNER_DP');
      }
    }
    if (adspotType == 2) {
      form.setFieldValue('adCrtNormalTypes', ylhAdCrtNormalTypesMap[adspotType].filter(item => item.isDefaultSelected).map(item => item.value));
    }
  };

  const handleSubmit = (values) => {
    // 激励视屏新建的时候，如果选择的是需要服务器判断给前端传入一个 32位随机大小写字母和1-9数字组成
    if (adspotType == 5 && needServerVerify == 'NeedServerVerify' && !isEditAdspotChannel) {
      values.secret = generateRandomString();
    }
    sdkChannelDispatcher.setSdkAutoAdspot(values, adspotType);
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
            name="priceType"
            label="价格策略"
            getValueFromEvent={e => e.target.value.trim()}
            rules={[{
              required: true,
              message: '请填写价格策略',
            }]}
            tooltip="排序方式选择【固价】时可设置目标eCPM；设置目标eCPM后，填充率和收入将会受影响；每天只可设置1次目标eCPM。"
          >
            <Radio.Group disabled={isEditAdspotChannel}>
              <Radio.Button value="1" disabled={!isHeadBidding || isEditAdspotChannel}>客户端实时竞价</Radio.Button>
              <Radio.Button value="2" disabled={!isHeadBidding || isEditAdspotChannel}>服务端实时竞价</Radio.Button>
              <Radio.Button value="3" disabled={!!isHeadBidding || isEditAdspotChannel}>目标价</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        {
          priceType == 3 ? <Col span={21}>
            <Form.Item
              name='ecpmPrice'
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
                    } else if (!/^\d/.test(value)) {
                      return Promise.reject('必须为数字,且是数字开头');
                    } else if ((!/^[0-9]*\.?\d{0,2}$/.test(value)) || value <= 0 || value > 10000){
                      return Promise.reject('价格必须在0.01-10000之间,最多两位小数');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input suffix='¥' disabled={!!isHeadBidding || isDisabledCpm} placeholder='请输入0.01-10000之间的数值' />
            </Form.Item>
          </Col> : <></>
        }
        
      </Row>
      <Col span={21}>
        <Form.Item
          name="placementName"
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
      <Col span={21}>
        <Form.Item
          name='adspotTypeName'
          label='广告位类型'
        >
          <Input bordered={false} disabled/>
        </Form.Item>
      </Col>
      {/* common 结束 */}

      {/* 只有插屏显示渲染样式 */}
      {/* 弹窗、全屏 */}
      {
        adspotType == 4 ? <Col span={21}>
          <Form.Item
            name='adCrtTemplateType'
            label='渲染样式'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel}>
              <Radio.Button value="INLINE_VHS">弹窗</Radio.Button>
              <Radio.Button value="INLINE_FULL">全屏</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col> : <></>
      }

      {/* 开屏、插屏、信息流显示广告素材类型 */}
      {/* 插屏： 图片、视频 */}
      {/* 信息流 && 模板渲染：图片（默认选中且不能取消）、视频 */}
      {/* 开屏：图片（默认选中且不能取消）、5S视频 */}
      {[1, 4].includes(adspotType) || (adspotType == 2 && renderType == 'TEMPLATE') ? <Col span={21}>
        <Form.Item
          label="广告素材类型"
          name="adCrtTypeList"
          required={true}
          rules={[{
            required: true,
            message: '请选择广告素材类型',
          }]}
        >
          <Checkbox.Group>
            {
              ylhAdCrtTypeMap[adspotType].map(item => {
                return (<Checkbox key={item.value} value={item.value} disabled={item.defaultDisabled || isEditAdspotChannel}>{item.name}</Checkbox>);
              })
            }
          </Checkbox.Group>
        </Form.Item>
      </Col> : <></>
      }

      {/* 插屏渲染样式是弹窗的时候，有广告样式多样性探索 */}
      {/* 或 */}
      {/* 信息流 是模板渲染的时候，也有广告样式多样性探索 */}
      {   
        (adspotType == 2 && renderType == 'TEMPLATE') ? <Col span={21}>
          <Form.Item
            name='enableExperiment'
            label='广告样式多样性探索'
            required
          >
            <Radio.Group disabled={isEditAdspotChannel} defaultValue={'Open'}>
              <Radio.Button value="Open">开启</Radio.Button> :
              <Radio.Button value="Close">关闭</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col> : <></>
      }


      {/* 横幅、信息流显示渲染方式 */}
      {[3, 2].includes(adspotType) ? <Col span={21}>
        <Form.Item
          name='renderType'
          label='渲染方式'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel} onChange={changeRenderType}>
            {/* 渲染方式 开屏仅自渲染 其它模版渲染 */}
            <Radio.Button value="TEMPLATE">模版渲染</Radio.Button>
            <Radio.Button value="NORMAL">自渲染</Radio.Button> 
          </Radio.Group>
        </Form.Item>
      </Col> : <></>}
      
      {/* 横幅 模板渲染时显示：模板样式 */}
      {adspotType == 3 && renderType == 'TEMPLATE' ? <Col span={21}>
        <Form.Item
          name='adCrtTemplateType'
          label='模板样式'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value="BANNER_DP">图文组合</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>: <></>}

      {/* 信息流 模板渲染的时候，显示模板样式，他和横幅 模板渲染时显示：模板样式 的显示样式不一样，所以不妨在一起展示了 */}
      {adspotType == 2 && renderType == 'TEMPLATE' ? <Col span={21}>
        <MultipleSelect 
          options={ylhAdCrtTypeListMap[adspotType]}
          label='模板样式'
          name='adCrtTemplateType'
          keyType='value'
          rules={[{ required: true, message: '请选择模板样式' }]}
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
        />
      </Col>: <></>}

      {/* 横幅 自渲染时显示：广告样式 */}
      {/* 信息流自渲染：广告样式 */}
      {([3, 2].includes(adspotType)) && renderType == 'NORMAL' ? <Col span={21}>
        <MultipleSelect 
          options={ylhAdCrtNormalTypesMap[adspotType]}
          label='广告样式'
          name='adCrtNormalTypes'
          keyType='value'
          rules={[{ required: true, message: '请选择广告样式' }]}
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
        />
      </Col>: <></>}

      {/* 激励视频 显示奖励发放设置和服务器判断*/}
      {adspotType == 5 && <><Col span={21}>
        <Form.Item
          name='rewardedVideoCrtType'
          label='渲染样式'
          required
        >
          <Checkbox.Group>
            {
              // 执行操作中的关闭广告源在监控维度是媒体、广告位的时候置灰
              ylhIncentiveRewardedVideoCrtType.map(item => {
                return (<Checkbox key={item.value} value={item.value} disabled={isEditAdspotChannel}>
                  {item.name}
                  {item.tootips && <Tooltip title={item.tootips}><QuestionCircleOutlined /></Tooltip>}
                </Checkbox>);
              })
            }
          </Checkbox.Group>
        </Form.Item>  
      </Col>
      <Col span={21}>
        <Form.Item
          name='needServerVerify'
          label='服务器判断'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value="NotNeedServerVerify">无需服务器判断</Radio.Button>
            <Radio.Button value="NeedServerVerify">需要服务器判断</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 服务器判断选择需要服务器判断 才显示回调URL */}
      {needServerVerify == 'NeedServerVerify' && <Row>
        <Col span={21}>
          <Form.Item
            name='transferUrl'
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
        </Col>
        <Col span={21}>
          <Form.Item
            name='secret'
            label="密钥"
          >
            <Input placeholder='成功创建广告源后，编辑广告源可查看' disabled/>
          </Form.Item>
        </Col>
      </Row>}</>}
    </Row>
  </DrawerForm>);
}

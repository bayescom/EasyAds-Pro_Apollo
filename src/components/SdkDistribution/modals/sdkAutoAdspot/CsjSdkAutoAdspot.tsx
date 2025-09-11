import { DrawerForm } from '@ant-design/pro-form';
import styles from './index.module.less';
import { Alert, Col, Form, Input, Radio, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { csjAdspotSize, csjTemplateLayouts, isMoreThan24Hours } from './utils';
import store from '@/store';
import { formatPayloadDataFromModal } from './utils/formatCsjSdkAutoAdspot';
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

export default function CsjSdkAutoAdspot({
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
  // 期望cpm
  const expectationCpm = Form.useWatch('expectationCpm', form);
  // 奖励发放设置
  const isRewardRetainPop = Form.useWatch('isRewardRetainPop', form);
  const rewardIsCallback = Form.useWatch('rewardIsCallback', form);

  const [isDisabledCpm, setIsDisabledCpm] = useState(false);
  const [notSetCpm, setNotSetCpm] = useState(false);
  
  const initialValues = {
    adspotTypeName: adspotTypeListMap[adspotType],
    expectationCpm: 0,
    // 开屏 自渲染，其它 模版渲染
    renderType: adspotType == 1 ? 3 : 1,
    orientation: 1,
    splashShake: 1,
    slideBanner: 2,
    adSlotSizeType: '300*150',
    isRewardRetainPop: 0,
    rewardIsCallback: 0,
    acceptMaterialType: 3,
    videoVoiceControl: 1,
    videoAutoPlay: 2,
    adRolloutSize: 1,
    skipDuration: '5',
    templateLayouts: csjTemplateLayouts.map(item => item.value)
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
      form.setFieldValue('adSlotName', channelAlias + '_' + getCurrentDateTimeFormatted());
    }
  }, [channelAlias, drawerFormVisible, isEditAdspotChannel, isEditThird]);

  useEffect(() => {
    if (drawerFormVisible) {
      if (isEditThird) {
        const editModalData = {};
        for(const key in thirdModalData) {
          if (key == 'cpm') {
            editModalData['expectationCpm'] = thirdModalData['cpm'] ? 1 : 0;
            editModalData['cpm'] = thirdModalData['cpm'];
            continue;
          }

          if (key == 'adSlotSizeType') {
            editModalData['adSlotSizeType'] = csjAdspotSize[thirdModalData?.adSlotSizeType - 1].value;
            continue;
          }

          // 账户名称、应用ID永远以广告源为准
          if (!['metaAppId', 'reportApiName'].includes(key)) {
            editModalData[key] = thirdModalData[key];
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
      if (!sdkChannelState.sdkAutoAdspot?.cpm) {
        setIsDisabledCpm(true);
      } else {
        setIsDisabledCpm(false);
      }

      // 2. 创建的时候选了设置也不让改不设置，只能改cpm一次
      if (sdkChannelState.sdkAutoAdspot?.cpm) {
        setNotSetCpm(true);
      } else {
        setNotSetCpm(false);
      }

      // 3. 24小时内只能编辑一次cpm
      if (sdkChannelState.cpmUpdateTime) {
        if (isMoreThan24Hours(sdkChannelState.cpmUpdateTime)) {
          setIsDisabledCpm(false);
        } else {
          setIsDisabledCpm(true);
        }
      }
    }
  }, [isEditAdspotChannel, drawerFormVisible]);

  const handleSubmit = (values) => {
    sdkChannelDispatcher.setSdkAutoAdspot(formatPayloadDataFromModal(values, adspotType));
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
      <Row style={{width: '100%'}}>
        <Col span={15}>
          <Form.Item
            name='expectationCpm'
            label='期望CPM'
            tooltip='排序方式选择【固价】时可编辑期望CPM；设置期望CPM后，填充率和收入将会受影响；每天只可设置1次期望CPM。'
            required
          >
            <Radio.Group disabled={!!isHeadBidding || isDisabledCpm}>
              <Radio.Button value={0} disabled={notSetCpm}>不设置期望CPM</Radio.Button>
              <Radio.Button value={1} >设置期望CPM</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        {expectationCpm == 1 && <Col span={6}>
          <Form.Item
            name='cpm'
            rules={[
              {
                validator: (_, value) => {
                  if (!value){
                    return Promise.reject('请输入期望的CPM');
                  } else if (!/^\d/.test(value)) {
                    return Promise.reject('必须为数字,且是数字开头');
                  } else if ((!/^[0-9]*\.?\d{0,2}$/.test(value)) || value <= 0){
                    return Promise.reject('价格必须大于0,最多两位小数');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder='请输入' suffix='¥' style={{height: 32}} disabled={isDisabledCpm || !!isHeadBidding}/>
          </Form.Item>
        </Col>}
      </Row>
      
      <Col span={21}>
        <Form.Item
          name="adSlotName"
          label="广告位名称"
          getValueFromEvent={e => e.target.value.trim()}
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
      <Col span={21}>
        <Form.Item
          name='renderType'
          label='渲染方式'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            {/* 渲染方式 开屏仅自渲染 其它模版渲染 */}
            {adspotType == 1 ? <Radio.Button value={3}>自渲染</Radio.Button> :
              <Radio.Button value={1}>模版渲染</Radio.Button>}
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 插屏显示广告铺开大小 */}
      {adspotType == 4 && <Col span={21}>
        <Form.Item
          name='adRolloutSize'
          label='广告铺开大小'
          required
          tooltip='优选将展现模型预估收益最佳的插屏样式，全屏/半屏均有机会展示，该流量场景需同时支持全屏和半屏广告'
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={1}>全屏</Radio.Button>
            <Radio.Button value={2}>半屏</Radio.Button>
            <Radio.Button value={3}>优选</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 信息流、插屏 显示素材类型 */}
      {[2, 4].includes(adspotType) && <Col span={21}>
        <Form.Item
          name='acceptMaterialType'
          label='素材类型'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={3}>视频+图片</Radio.Button>
            <Radio.Button value={1}>仅图片</Radio.Button>
            <Radio.Button value={2}>仅视频</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 开屏、激励视频、插屏 显示屏幕方向 */}
      {[1, 5, 4].includes(adspotType) &&<Col span={21}>
        <Form.Item
          name='orientation'
          label='屏幕方向'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={1}>竖屏</Radio.Button>
            <Radio.Button value={2}>横屏</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 信息流 显示优选模版 */}
      {adspotType == 2 && <Col span={21}>
        <MultipleSelect 
          options={csjTemplateLayouts}
          label='优选模版'
          name='templateLayouts'
          keyType='value'
          isValueTypeArray={true}
          isNoShowIdOrValue={true}
          disabled={isEditAdspotChannel}
        />
      </Col>}
      {/* 信息流、插屏 显示视频声音*/}
      {[2, 4].includes(adspotType) && <Col span={21}>
        <Form.Item
          name='videoVoiceControl'
          label='视频声音'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={2}>有声音</Radio.Button>
            <Radio.Button value={1}>静音</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 信息流、插屏 显示视频自动播放 */}
      {[2, 4].includes(adspotType) && <Col span={21}>
        <Form.Item
          name='videoAutoPlay'
          label='视频自动播放'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={2}>有网络自动播放</Radio.Button>
            <Radio.Button value={1}>wifi下自动播放</Radio.Button>
            <Radio.Button value={3}>不自动播放</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 横幅 显示是否轮播、广告位尺寸 */}
      {adspotType == 3 && <><Col span={21}>
        <Form.Item
          name='slideBanner'
          label='是否轮播'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={2}>是</Radio.Button>
            <Radio.Button value={1}>否</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      <Col span={21}>
        <Form.Item
          name='adSlotSizeType'
          label='广告位尺寸'
          required
        >
          <Select options={csjAdspotSize} disabled={isEditAdspotChannel}/>
        </Form.Item>
      </Col></>}
      {/* 激励视频 显示奖励发放设置和服务器判断*/}
      {adspotType == 5 && <><Col span={21}>
        <Form.Item
          name='isRewardRetainPop'
          label='奖励发放设置'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={0}>不设置奖励</Radio.Button>
            <Radio.Button value={1}>设置奖励</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 奖励发放设置选择设置奖励 才显示奖励名称、奖励数量 */}
      {isRewardRetainPop == 1 && <Row className={styles['inline-row']}>
        <Col span={12}>
          <Form.Item
            name='rewardName'
            rules={[{ required: true, message: '请输入奖励名称' }]}
          >
            <Input placeholder='请输入奖励名称' disabled={isEditAdspotChannel}/>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name='rewardCount'
            rules={[{ required: true, message: '请输入奖励数量' }]}
          >
            <Input placeholder='请输入奖励数量' disabled={isEditAdspotChannel}/>
          </Form.Item>
        </Col>
      </Row>}
      <Col span={21}>
        <Form.Item
          name='rewardIsCallback'
          label='服务器判断'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={0}>无需服务器判断</Radio.Button>
            <Radio.Button value={1}>需要服务器判断</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      {/* 服务器判断选择需要服务器判断 才显示回调URL */}
      {rewardIsCallback == 1 && <Row className={styles['inline-row']}>
        <Col span={12}>
          <Form.Item
            name='rewardCallbackUrl'
            rules={[{ required: true, message: '请输入回调URL' }]}
          >
            <Input placeholder='请输入回调URL' disabled={isEditAdspotChannel}/>
          </Form.Item>
        </Col>
      </Row>}</>}
      
      {/* 开屏 显示创意交互形式 */}
      {adspotType == 1 && <Col span={21}>
        <Form.Item
          name='splashShake'
          label='创意交互形式'
          required
        >
          <Radio.Group disabled={isEditAdspotChannel}>
            <Radio.Button value={1}>开启</Radio.Button>
            <Radio.Button value={2}>关闭</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>}
      {/* 插屏 显示n秒后显示跳过按钮 */}
      {/* 全屏数值范围为5-15s；插屏数值范围为0-15s */}
      {adspotType == 4 && <Col span={12}>
        <Form.Item
          name='skipDuration'
          label='n秒后显示跳过按钮'
          rules={[
            { required: true, message: '请输入${label}' },
            {type: 'number', transform: value => +value, min: 0, max: 15, message: '配置范围为0～15的整数'}
          ]}
          tooltip='仅支持视频类素材配置时长；配置范围为0～15的整数，用以控制广告跳过按钮展示时机'
        >
          <Input disabled={isEditAdspotChannel} min={0} max={15}/>
        </Form.Item>
      </Col>}
    </Row>
  </DrawerForm>);
}

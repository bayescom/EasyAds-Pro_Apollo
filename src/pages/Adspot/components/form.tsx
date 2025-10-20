import ProCard from '@ant-design/pro-card';
import { Form, Row, Col, Radio, Select, Typography,Image, Space, Input, Switch } from 'antd';
import store from '@/store';
import { useEffect, useState } from 'react';
import mediumService from '@/services/medium';
import { IMedium } from '@/models/types/medium';
import styles from '../index.module.less';
import { CopyOutlined, SearchOutlined } from '@ant-design/icons';
import bannerIcon from '@/assets/icons/adspot/banner.png';
import bannerActiveIcon from '@/assets/icons/adspot/bannerActive.png';
import bannerReadonlyIcon from '@/assets/icons/adspot/bannerReadonly.png';
import feedIcon from '@/assets/icons/adspot/feed.png';
import feedActiveIcon from '@/assets/icons/adspot/feedActive.png';
import feedReadonlyIcon from '@/assets/icons/adspot/feedReadonly.png';
import incentiveIcon from '@/assets/icons/adspot/incentive.png';
import incentiveActiveIcon from '@/assets/icons/adspot/incentiveActive.png';
import incentiveReadonlyIcon from '@/assets/icons/adspot/incentiveReadonly.png';
import interstitialIcon from '@/assets/icons/adspot/interstitial.png';
import interstitialActiveIcon from '@/assets/icons/adspot/interstitialActive.png';
import interstitialReadonlyIcon from '@/assets/icons/adspot/interstitialReadonly.png';
import splashIcon from '@/assets/icons/adspot/splash.png';
import splashActiveIcon from '@/assets/icons/adspot/splashActive.png';
import splashReadonlyIcon from '@/assets/icons/adspot/splashReadonly.png';
import { platformIconMap, mediaIconMap } from '@/components/Utils/Constant';
import { randomString } from '@/services/utils/utils';
import CopyableText from '@/components/CopyableText';

const ImageNameMap = {
  // 横幅
  '3': {
    icon: bannerIcon,
    activeIcon: bannerActiveIcon,
    readonlyIcon: bannerReadonlyIcon,
  },
  // 开屏
  '1': {
    icon: splashIcon,
    activeIcon: splashActiveIcon,
    readonlyIcon: splashReadonlyIcon,
  },
  // 插屏
  '4': {
    icon: interstitialIcon,
    activeIcon: interstitialActiveIcon,
    readonlyIcon: interstitialReadonlyIcon,
  },
  // 信息流
  '2': {
    icon: feedIcon,
    activeIcon: feedActiveIcon,
    readonlyIcon: feedReadonlyIcon,
  },
  // 激励视频
  '5': {
    icon: incentiveIcon,
    activeIcon: incentiveActiveIcon,
    readonlyIcon: incentiveReadonlyIcon,
  }
};

type MediumFilterOption = {
  id: number,
  name: string,
  platform: number,
  iconUrl: string
};

interface IProps {
  mediaChanged?: (value: any) => void,
  adspotTypechanged?: (value: any) => void,
  isEdit?: boolean,
  currentAdspotType: string,
  mediaId?: number,
  showFcrequencySetting: boolean,
  setShowFcrequencySetting: (value: boolean) => void,
  setFilterOption?: (value: any[]) => void,
  filterOption?: any[],
  currentImplementMethod: number,
  isShowRewardReveal: boolean,
  securityKey: string,
  setSecurityKey: (value: string) => void,
  changeRewardReveal?: (value: number) => void,
}

const { Option } = Select;
const { Text, Title } = Typography;
const adspotDispatcher = store.getModelDispatchers('adspot');

export default function AdspotForm({
  mediaChanged,
  adspotTypechanged,
  isEdit,
  currentAdspotType,
  mediaId,
  showFcrequencySetting,
  setShowFcrequencySetting,
  setFilterOption,
  filterOption,
  currentImplementMethod,
  isShowRewardReveal,
  securityKey,
  setSecurityKey,
  changeRewardReveal
}: IProps) {
  const adspot = store.useModelState('adspot');

  const [mediumList, setMediumList] = useState<MediumFilterOption[]>([]);
  const [mediumMap, setMediumMap] = useState({});
  const [hoveringAdspotType, setHoveringAdspotType] = useState(null);
  
  useState(async () => {
    const data = await mediumService.getList({status: 1});   

    const newMediumList = data.medias.map((item: IMedium) => ({
      id: item.id,
      name: item.mediaName,
      platform: item.platformType,
    }));
    setMediumList(newMediumList);
    setFilterOption && setFilterOption(newMediumList);
    adspotDispatcher.setMediumList(newMediumList);

    setMediumMap(data.medias.reduce((pre: { [x: string]: { text: any; platformType: any; } }, cur: { id: string | number; mediaName: any; platformType: any; }) => {
      pre[cur.id] = { text: cur.mediaName, platformType: cur.platformType};
      return pre;
    }, {}));
  });

  // 聚合SDK && 激励视频 && 安卓、ios媒体 显示服务端激励回调
  const isShowBasicServerCallback = currentImplementMethod == 0 && currentAdspotType == '5' && mediaId && mediumMap[mediaId] && [0, 1].includes(mediumMap[mediaId].platformType);
  
  const mediaOnChange = (value: string | number) => {
    if (value) {
      const currentMedia = mediumMap[value];
      mediaChanged && mediaChanged(currentMedia.text);
    } else {
      mediaChanged && mediaChanged('');
    }
  };

  const adspotTypeChange = (value: string | number) => {
    const currentAdspotTypeInfo = adspot.layoutList?.find(item => item.value == value);
    adspotTypechanged && adspotTypechanged(currentAdspotTypeInfo?.name);
  };

  const handleMouseOver = (adspotType) => {
    setHoveringAdspotType(adspotType);
  };

  const handleMouseOut = () => {
    setHoveringAdspotType(null);
  };

  const changeSwitchFcrequency = (status) => {
    status ? setShowFcrequencySetting(true) : setShowFcrequencySetting(false);
  };

  const handleSearch = (e) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = mediumList.filter(item => item.id.toString().includes(text)
       || item.name.toString().toLowerCase().includes(text.toLowerCase()));
      setFilterOption && setFilterOption(result);
    } else {
      setFilterOption && setFilterOption(mediumList);
    }
  };

  return (<>
    <ProCard style={{ maxWidth: '900px', margin: '0 auto'}}>
      <Title level={5}>基础设置</Title>
      <Row gutter={8} wrap={false}>
        <Col span={12}>
          <Form.Item
            label="选择媒体"
            name="mediaId"
            required={true}
            rules={[{
              required: true,
              message: '选择媒体',
            }]}
            className={[styles['adspot-media-select'], isEdit ? styles['edit-media-select'] : ''].join(' ')}
          >
            <Select 
              allowClear
              onChange={mediaOnChange}
              disabled={isEdit}
              placeholder={mediumList.length ? '请选择媒体' : '当前无媒体，请创建媒体'}
              dropdownRender={(menu) => (
                <>
                  <div className={styles['custom-container']}>
                    <Form.Item name='search-mediaId'>
                      <Input onChange={(e) => handleSearch(e)}
                        className={styles['custom-input']}
                        allowClear 
                        prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                        ref={input => input?.focus()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Form.Item>
                  </div>
                  {menu}
                </>
              )}
              popupClassName={styles['media-popup-container']}
            >
              {filterOption && filterOption.map(item => (
                <Option key={item.id} value={item.id} label={item.name} className={styles['adspot-media-option']}>
                  <Space size={0}>
                    <Image src={ mediaIconMap[item.platform] } style={{ width: '32px', height: 'auto', marginBottom: 4 }} preview={false}/>
                    <div>
                      <Text>{item.name}</Text>
                      <div>
                        <Image 
                          src={ platformIconMap[item.platform] }
                          style={{ width: '16px', height: 'auto', marginBottom: 4 }} 
                          preview={false}
                        />
                        <Text type="secondary">{item.id}</Text>
                      </div>
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={8} wrap={false}>
        <Col span={24}>
          <Form.Item
            label="接入方式"
            name="integrationType"
            required={true}
            rules={[{
              required: true,
              message: '接入方式',
            }]}
          >
            <Radio.Group>
              <Radio.Button key='0' value={0} disabled={isEdit}>聚合SDK</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item 
            label="广告位类型" 
            name="adspotType"
            required={true}
            rules={[
              { required: true, message: '请选择广告位类型' }
            ]}
          >
            <Radio.Group className={styles['layout-btn-group']}>
              {
                adspot.layoutList?.map((item) => (<div key={item.value} onMouseOver={() => handleMouseOver(item.value)} onMouseOut={() => handleMouseOut()} className={[styles['layout-wrap'], item.value != hoveringAdspotType ? '' : styles['hover-layout-wrap']].join(' ')}>
                  <Radio.Button value={Number(item.value)} onChange={e => adspotTypeChange(e.target.value)} disabled={isEdit}>
                    <div className={styles['layout-container']} >
                      <div className={styles['layout-left']}>
                        {
                          isEdit && item.value === currentAdspotType ? <Image src={ImageNameMap[item.value].readonlyIcon} preview={false} width={45} style={{verticalAlign: 'text-top'}} /> :
                            <Image src={`${(isEdit || (item.value != currentAdspotType && item.value != hoveringAdspotType)) ? ImageNameMap[item.value].icon : ImageNameMap[item.value].activeIcon}`} preview={false} width={45} style={{verticalAlign: 'text-top'}} />
                        }
                      </div>
                      <div className={styles['layout-right']}>
                        <p className={styles['layout-name']}>{item.name}</p>
                        <p className={`layout-desc ${item.value == currentAdspotType ? 'layout-checked' : ''}`}>{item.extension}</p>
                      </div>
                    </div>
                  </Radio.Button>
                </div>
                ))
              }
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={13}>
          <Form.Item 
            label="广告位名称" 
            name="adspotName"
            required={true}
            rules={[
              { required: true, message: '请填写广告位名称', type: 'string' }
            ]}
            style={{height: '30px'}}
            getValueFromEvent={e => e.target.value.trim()}
          >
            <Input placeholder='' style={{height: '30px', width: '290px'}}/>
          </Form.Item>
        </Col>
        <Col span={13}>
          <Form.Item
            label="广告位超时时间"
            name="timeout"
            getValueProps={(value) => ({value: value || null})}
            tooltip='广告位一次请求最长等待时间，若超过超时时间仍未返回任何广告，则放弃本次请求'
            getValueFromEvent={e => e.target.value.trim()}
          >
            <Input placeholder='请输入广告位超时时间' suffix="毫秒" style={{width: '290px'}}/>
          </Form.Item>
        </Col>
      </Row>
      {isShowBasicServerCallback && <Row gutter={16}>
        <Col span={13}>
          <Form.Item
            label="服务端激励回调"
            name="rewardReveal"
            tooltip='激励视频广告类型可以设置服务端回调激励，在用户观看完成视频后，Blink服务端会向您的服务器回调激励信息。聚合-Android SDK v5.1.4及以上版本，iOS SDK v5.1.5及以上版本支持。'
            normalize={(checked) => +checked}
            valuePropName='checked'
          >
            <Switch size='small' onChange={(checked) => changeRewardReveal && changeRewardReveal(+checked)}/>
          </Form.Item>
        </Col>
        {
          isShowRewardReveal ? <>
            <Col span={13}>
              <Form.Item
                label="激励名称"
                name="rewardName"
                getValueFromEvent={e => e.target.value.trim()}
                rules={[{required: true, message: '请输入激励名称'}]}
              >
                <Input style={{width: '290px'}}/>
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                label="激励数量"
                name="rewardAmount"
                getValueFromEvent={e => e.target.value.trim()}
                rules={[
                  {
                    required: true,
                    message: '请输入激励数量',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (!/^\d+$/.test(value)){
                        return Promise.reject('激励数量只能是正整数');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input type='number' style={{width: '290px'}}/>
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                label="回调URL"
                name="rewardCallback"
                getValueFromEvent={e => e.target.value.trim()}
                rules={[{required: true, message: '请输入回调URL'}]}
              >
                <Input style={{width: '290px'}}/>
              </Form.Item>
            </Col>
            <Col span={13} className={styles['adspot-security-key']}>
              <span className={styles['security-key-label']}>Security Key</span>
              <div className={styles['security-input']}>
                <span className={styles['security-key-value']}>{securityKey}</span>
                <CopyableText text={securityKey} nameInTooltip='Security Key'>
                  <CopyOutlined />
                </CopyableText>
              </div>
              <span className={styles['security-key-reload']} onClick={() => setSecurityKey(randomString(16))}>刷新</span>
            </Col>
          </> : <></>
        }
      </Row>}
    </ProCard>
    {/* 频次控制 */}
    <ProCard style={{ maxWidth: '900px', margin: '9px auto'}} className={[styles['collapse-wrap'], styles['fcrequency-container']].join(' ')}>
      <Title level={5}>
        频次控制
        <Form.Item
          name="switchFcrequency"
          valuePropName="checked"
        >
          <Switch onChange={(status) => changeSwitchFcrequency(status)} size='small'/>
        </Form.Item>
      </Title>
      <Row gutter={8} style={{flexDirection: 'column'}}>
        {showFcrequencySetting ? <><Row className={styles['device-limit']}>
          <Col span={8}>
            <Form.Item
              // label="单设备每日请求上限"
              label="单设备每日上限"
              name="deviceDailyReqLimit"
              getValueProps={(value) => ({value: value || null})}
              tooltip='单个设备一天内可请求到此广告位/可展示此广告位广告的次数上限'
              getValueFromEvent={e => e.target.value.trim()}
            >
              <Input placeholder='不限' prefix='请求'/>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              // label="单设备每日曝光上限"
              name="deviceDailyImpLimit"
              getValueProps={(value) => ({value: value || null})}
              getValueFromEvent={e => e.target.value.trim()}
            >
              <Input placeholder='不限' prefix='展示'/>
            </Form.Item>
          </Col>
        </Row>
        <Col span={12}>
          <Form.Item
            label="单设备最小请求间隔"
            name="deviceReqInterval"
            getValueProps={(value) => ({value: value || null})}
            tooltip='单个设备上次广告展示与下次广告请求之间的时间间隔'
            getValueFromEvent={e => e.target.value.trim()}
          >
            <Input placeholder='请输入单设备最小请求间隔' suffix='秒' style={{width: '290px'}}/>
          </Form.Item>
        </Col></> : <></>}
      </Row>
    </ProCard>
  </>);
}

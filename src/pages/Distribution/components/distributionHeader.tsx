import AbTestButton from '@/components/SdkDistribution/AbTestButton';
import store from '@/store';
import ProCard from '@ant-design/pro-card';
import { Form, Row, Select, Space, Image, Typography, Tooltip, Input } from 'antd';
import { useHistory, useLocation } from 'ice';
import { useEffect, useState } from 'react';
import styles from '../index.module.less';
import { SearchOutlined } from '@ant-design/icons';
import searchSelectStyles from '@/components/SearchSelect/index.module.less';
import { adspotTypeAllList, mediaIconMap, platformIconMap } from '@/components/Utils/Constant';
import { sortByOrder } from '@/services/utils/utils';

const { Option } = Select;
const { Text } = Typography;

const distributionDispatcher = store.getModelDispatchers('distribution');

function DistributionHeader() {
  const distributionState = store.useModelState('distribution');
  const sdkDistributionState = store.useModelState('sdkDistribution');

  const [form] = Form.useForm();
  const history = useHistory();

  const [mediumFilterOption, setMediumFilterOption] = useState<any[]>([]);
  const [adspotFilterOption, setAdspotFilterOption] = useState<any[]>([]);

  // 广告位类型的列表
  const [adspotTypeList, setAdspotTypeList] = useState<string[]>([]);
  // 广告位类型筛选的值
  const [adspotTypeFilter, setAdspotTypeFilter] = useState('');
  const [isCreateAbTesting, setIsCreateAbTesting] = useState(false);

  const location = useLocation();

  // 媒体
  useEffect(() => {
    setMediumFilterOption(distributionState.mediumList);
    if (distributionState.mediumList.length) {
      const locationMediaId = new URLSearchParams(location.search).get('mediaId');
      const mediaId = locationMediaId ? +locationMediaId : distributionState.mediumList[0].id;
      if (mediaId) { // 地址栏有mediaId/列表第一位有Id
        const isCurrentCompanyMediaId = distributionState.mediumList.find(item => item.id == mediaId);
        // 是本公司的媒体
        if (isCurrentCompanyMediaId) {
          distributionDispatcher.setMediaId(mediaId);
          form.setFieldValue('medium', mediaId);
        } else {
          distributionDispatcher.setMediaId(distributionState.mediumList[0].id);
          form.setFieldValue('medium', distributionState.mediumList[0].id);
        }
      }
    } else {
      distributionDispatcher.setMediaId(0);
      form.setFieldValue('medium', undefined);
    }
  }, [distributionState.mediumList]);

  // 广告位
  useEffect(() => {
    // 地址栏存在
    if (distributionState.adspotList.length) {
      const locationMediaId = new URLSearchParams(location.search).get('mediaId');
      const locationAdspotId = new URLSearchParams(location.search).get('adspotId');
      if (locationMediaId == 'null' && locationAdspotId) { // 媒体null，但是adspotId有值，常见跳转
        const currentAdspot = distributionState.adspotList.filter(item => item.id == +locationAdspotId);
        if (currentAdspot.length) { // 防state里有数据存储导致这里为[]
          distributionDispatcher.setAdspotId(currentAdspot[0].id);
          form.setFieldValue('adspot', currentAdspot[0].id);
          history.push(`/traffic/distribution?mediaId=${currentAdspot[0].mediaId}&adspotId=${currentAdspot[0].id}`);
          distributionDispatcher.setMediaId(currentAdspot[0].mediaId);
          form.setFieldValue('medium', currentAdspot[0].mediaId);
        }
      } else { // 不出意外，这里是正常情况
        if (locationAdspotId) { // 常见于地址栏有值
          const currentAdspot = distributionState.adspotList.filter(item => item.id == +locationAdspotId);
          if (currentAdspot.length) {
            distributionDispatcher.setAdspotId(+locationAdspotId);
            form.setFieldValue('adspot', +locationAdspotId);
          } else { // 此处受index.tsx的请求影响，进入此判断，说明不是本公司广告位
            baseChangeDistributionStateAdspotCorrelation(distributionState.adspotList[0]);
          }
        } else { // 首次载入且不是跳转时，这里是无值的
          baseChangeDistributionStateAdspotCorrelation(distributionState.adspotList[0]);
        }
      }

      // 广告位未经任何搜索、快速选择的原下拉列表
      distributionDispatcher.setAdspotSelectOptions(distributionState.adspotList);
    } else {
      distributionDispatcher.setAdspotId(0);
      form.setFieldValue('adspot', undefined);
    }
  }, [distributionState.adspotList]);

  useEffect(() => {
    if (sdkDistributionState[distributionState.adspotId] && sdkDistributionState[distributionState.adspotId].percentageList.length <= 1) {
      if (sdkDistributionState[distributionState.adspotId].percentageList[0].trafficGroupList.find(trafficGroup => trafficGroup.groupStrategy.groupTargetId == distributionState.currentTargetId)?.targetPercentageStrategyList.length == 1) {
        setIsCreateAbTesting(true);
      } else {
        setIsCreateAbTesting(false);
      }
    } else {
      setIsCreateAbTesting(false);
    }
  }, [sdkDistributionState, distributionState.adspotId, distributionState.currentTargetId]);

  /** 设置广告位初始相关信息 */
  const baseChangeDistributionStateAdspotCorrelation = (currentAdspot) => {
    distributionDispatcher.setAdspotId(currentAdspot.id);
    form.setFieldValue('adspot', currentAdspot.id);
    // 媒体变了，广告位列表自会跟着变，所以不需要多做判断
    history.push(`/traffic/distribution?mediaId=${currentAdspot.mediaId}&adspotId=${currentAdspot.id}`);
  };

  useEffect(() => {
    const adspotTypeList = distributionState.adspotSelectOptions.map(item => item.adspotTypeName);
    const adspotTypeListNoSort = [...new Set([...adspotTypeList])];
   
    setAdspotTypeList(sortByOrder(adspotTypeAllList, adspotTypeListNoSort));
    setAdspotFilterOption(distributionState.adspotSelectOptions);
  }, [distributionState.adspotSelectOptions]);

  const changeAdspotType = (value: string) => {
    const query = adspotTypeFilter == value ? '' : value;
    setAdspotTypeFilter(query);
    const result = distributionState.adspotSelectOptions.filter(item => item.id.toString().includes(query)
      || item['adspotTypeName'].toString().toLowerCase().includes(query.toLowerCase()));
    setAdspotFilterOption(result);
  };

  const handleSearch = ({e, key, options, valueName}) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = options.filter(item => item.id.toString().includes(text)
       || item[valueName].toString().toLowerCase().includes(text.toLowerCase()));

      key == 'medium' ? setMediumFilterOption(result) : setAdspotFilterOption(result);
    } else {
      key == 'medium' ? setMediumFilterOption(options) : setAdspotFilterOption(options);
    }
  };

  // 切换媒体
  const handleChangeMediaId = (value) => {
    distributionDispatcher.setMediaId(value);
    distributionDispatcher.setAdspotId(0);
    distributionDispatcher.getAdspotList({mediaIds: value});
    form.setFieldValue('search-medium', undefined);
    history.push(`/traffic/distribution?mediaId=${value}`); // 为了让逻辑进入地址栏无adspotId的判断
  };

  // 切换广告位
  const handleChangeAdspotId = (value) => {
    distributionDispatcher.setAdspotId(value);
    const currentAdspot = distributionState.adspotList.find(item => item.id == value);
    form.setFieldValue('search-adspot', undefined);
    setAdspotFilterOption(distributionState.adspotList);
    history.push(`/traffic/distribution?mediaId=${currentAdspot?.mediaId}&adspotId=${value}`);
  };

  return (<>
    <ProCard bodyStyle={{ padding: '12px 16px' }} style={{marginBottom: '9px', marginTop: '8px'}}>
      <Form 
        className={styles['distribution-header-form']}
        form={form}
      >
        <Row>
          <Form.Item
            name="medium"
            label="媒体"
            className={styles['distribution-select']}
          >
            <Select
              placeholder="请选择"
              onChange={(value) => handleChangeMediaId(value)}
              dropdownRender={(menu) => (
                <>
                  <div className={searchSelectStyles['custom-container']}>
                    <Form.Item name='search-medium'>
                      <Input onChange={(e) => handleSearch({e, key: 'medium', options: distributionState.mediumList, valueName: 'mediaName'})}
                        className={searchSelectStyles['custom-input']}
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
              popupClassName={[searchSelectStyles['popup-search-select'], searchSelectStyles['platform-container']].join(' ')}
            >
              {mediumFilterOption.map(item => (
                <Option key={item.id} value={item.id} label={item.mediaName}>
                  <Space size={0}>
                    <Image src={ mediaIconMap[item.platformType] } style={{ width: '32px', height: 'auto', marginRight: '4px' }} preview={false}/>
                    <Space align='start' direction="vertical" size={0} className={searchSelectStyles['text-contianer']}>
                      {item.mediaName.length > 12 ? <Tooltip title={item.mediaName} placement='right'>{item.mediaName}</Tooltip> : <Text>{item.mediaName}</Text>}
                      <div>
                        <Image
                          src={ platformIconMap[item.platformType] }
                          style={{ width: '16px', height: '15px', marginTop: -17 }}
                          preview={false}
                        />
                        <Text type="secondary">
                          {item.id}
                        </Text>
                      </div>
                    </Space>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="adspot"
            label="广告位"
            className={styles['distribution-select']}
          >
            <Select
              placeholder="请选择"
              onChange={(value) => handleChangeAdspotId(value)}
              popupClassName={searchSelectStyles['popup-search-select']}
              dropdownRender={(menu) => (
                <>
                  <div className={searchSelectStyles['custom-container']}>
                    <Form.Item name='search-adspot'>
                      <Input onChange={(e) => handleSearch({e, key: 'adspot', options: distributionState.adspotSelectOptions, valueName: 'adspotName'})}
                        className={searchSelectStyles['custom-input']}
                        allowClear 
                        prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                        ref={input => input?.focus()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Form.Item>
                    {
                      adspotTypeList.length > 0 && <div className={styles['adspot-type-tags']}
                      >
                        {
                          adspotTypeList.map(item => 
                            (
                              <div 
                                key={item}
                                onClick={() => changeAdspotType(item)}
                                className={[styles['adspot-type-button'], adspotTypeFilter == item ? styles['adspot-type-is-active']: ''].join(' ')}
                              >
                                {item}
                              </div>
                            )
                          )
                        }
                      </div>
                    }
                  </div>
                  {menu}
                </>
              )}
            >
              {adspotFilterOption.map(item => (
                <Option  value={item.id} label={item.adspotName} key={item.id}>
                  <Space align='start' direction="vertical" size={0}>
                    <Space align='start' direction="vertical" size={0} className={searchSelectStyles['text-contianer']}>
                      {item.adspotName.length > 12 ? <Tooltip title={item.adspotName} placement='right'>
                        <div className={styles['adspot-type-tag']}>{item.adspotTypeName}</div>
                        {item.adspotName}
                      </Tooltip> : <Text>
                        <div className={styles['adspot-type-tag']}>{item.adspotTypeName}</div>
                        {item.adspotName}
                      </Text>}
                      <Text type="secondary">{item.id}</Text>
                    </Space>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Row>
      </Form>
    </ProCard>
    <div className={styles['right-button-container']}>
      {sdkDistributionState[distributionState.adspotId] ? 
        <AbTestButton
          abTesting={!isCreateAbTesting}
          adspotId={distributionState.adspotId}
          percentageList={sdkDistributionState[distributionState.adspotId].percentageList}
        /> : <></>}
    </div>
  </>);
}

export default DistributionHeader;

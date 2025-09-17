import store from '@/store';
import { DownOutlined, ExclamationCircleFilled, FileTextOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Spin, Tabs, Tooltip } from 'antd';
import TargetingGroupInfo from './TargetingGroupInfo';
import styles from './index.module.less';
import PercentageGroup from './PercentageGroup';
import PercentageGroupByWaterfall from './PercentageGroupByWaterfall';
import AbTestByWaterfall from './AbTestByWaterfall';
import { useEffect, useState } from 'react';
import SdkAdspotChannelForm from './modals/SdkAdspotChannelForm';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import ProCard from '@ant-design/pro-card';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import DragSuppliersTable from './DragSuppliersTable';
import TimeType from './modals/TimeType';
import Setting from './modals/Setting';
import DataTargetForm from './modals/DataTargetForm';
import BatchCreationSdkChannelFormMoadl from './modals/batchCreationSdkChannelForm';
import { getLocalDateType } from './utils';
import distributionStyles from '@/pages/Distribution/index.module.less';
import EmptyImg from './modals/EmptyImg';

type IProps = {
  visible: boolean,
  setVisible: (value: boolean) => void,
  loading: boolean, 
  setLoading: (value: boolean) => void,
}

const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');
const distributionDispatcher = store.getModelDispatchers('distribution');
const sdkAdspotChannelDispatcher = store.getModelDispatchers('sdkAdspotChannel');

function SdkDistribution({ visible, setVisible, loading, setLoading }: IProps) {
  const sdkAdspotChannelState = store.useModelState('sdkAdspotChannel');
  const distributionState = store.useModelState('distribution');
  const sdkDistributionState = store.useModelState('sdkDistribution');
  const [batchCreationVisible, setBatchCreationVisible] = useState(false);
  const [abTesting, setAbTesting] = useState(false);

  useEffect(() => {
    if (distributionState.adspotId) {
      setLoading(true);
      const localDateType = window.sessionStorage.getItem('commonDateType');
      const dateType = localDateType ? JSON.parse(localDateType) : distributionState.time;
      // 1. 获取广告位SDK渠道列表
      sdkAdspotChannelDispatcher.getList({ adspotId: distributionState.adspotId, dateType });
      // 2. 获取AB分组信息
      sdkDistributionDispatcher.queryAdspotSdkDistribution({ adspotId: distributionState.adspotId, dateType }).then(() => setLoading(false));
    }
  }, [distributionState.adspotId]);

  // 这个地方，当用户的广告位id变了之后，将 currentTargetId 和 currentGroupTargetId 置为0，是因为，主要是搭配下面一个 useEffect 使用的.但是会在 切换广告位的时候，因为缓存，导致 currentTargetId 还是未切换之前的分组id,因此，在切换广告位之后将 currentTargetId重新变为0。
  useEffect(() => {
    distributionDispatcher.setCurrentTargetId(0);
    distributionDispatcher.setCurrentGroupTargetId(0);
  }, [distributionState.adspotId]);

  // 只有发送了请求sdkDistributionState[distributionState.adspotId]才会有数据
  useEffect(() => {
    // 默认给附上 【默认分组的 groupTargetId】，以便在未进行任何ab测试，且未进行任何分组点击切换时，也就是默认分组的时候，打开创建ab测试的弹窗，要选中【默认分组】
    if (sdkDistributionState[distributionState.adspotId] && sdkDistributionState[distributionState.adspotId].percentageList) {
      // 在瀑布流的时候，如果有两个分组1，2，点击分组2的编辑ab测试表单并保存之后，会导致sdkDistributionState 变化，从而导致currentTargetId会变为最初始状态，  =》（如果没有这个判断的话 if (!distributionState.currentTargetId)，会导致 currentTargetId 变为分组1的targetId, 加了这个判断之后，就不会重置为分组1）
      // 但是会在 切换广告位的时候，因为缓存，导致 currentTargetId 还是未切换之前的分组id,因此，在切换广告位之后将 currentTargetId重新变为0。
      // 再切换广告位的时候，先 currentTargetId = 0.然后会走这个if。
      // 除了切换广告位和页面初始化，其他都不会走这个if，就保证了 sdkDistributionState 变化（比如我在ab表单新建或者更新的时候）之后，不会将currentTargetId 变化。
      if (!distributionState.currentTargetId) {
        distributionDispatcher.setCurrentTargetId(sdkDistributionState[distributionState.adspotId].percentageList[0].trafficGroupList[0].groupStrategy.groupTargetId);
        distributionDispatcher.setCurrentGroupTargetId(sdkDistributionState[distributionState.adspotId].percentageList[0].trafficPercentage.percentageId);
      }
    }
    if (distributionState.adspotId && sdkDistributionState[distributionState.adspotId] && (sdkDistributionState[distributionState.adspotId].percentageList[0].trafficGroupList.some(trafficGroup => trafficGroup.targetPercentageStrategyList.length > 1) || sdkDistributionState[distributionState.adspotId].percentageList.length > 1)) {
      setAbTesting(true);
    } else {
      setAbTesting(false);
    }
  }, [sdkDistributionState, distributionState.adspotId]);

  const newSdkAdspotChannel: ISdkAdspotChannel = { ...sdkAdspotChannelState.new, adspotId: distributionState.adspotId };

  const deleteTargetingGroup = (percentageGroupId, targetingGroupId) => {
    sdkDistributionDispatcher.deleteTargetingGroup({ adspotId: distributionState.adspotId, percentageGroupId, targetingGroupId });
  };

  const submitForm = () => {
    setLoading(true);
    const localDateType = getLocalDateType();
    const dateType = localDateType ? localDateType : distributionState.time;
    sdkAdspotChannelDispatcher.getList({ adspotId: distributionState.adspotId, dateType}).then(() => setLoading(false));
  };

  // 通过 targetPercentageStrategyList 是否长度为1 来确定是不是 瀑布流的分组 还是说没有进行任何 ab 实验，其实不对，如果是瀑布流的，第一个组没有进行ab分组，第二个组进行了ab分组的，就会被误判为没有进行任何ab实验。正确的应该是检查 percentageList[0].trafficGroupList 循环里面所有的 targetPercentageStrategyList 是不是长度都是1
  const isNotWaterfall = sdkDistributionState[distributionState.adspotId] && sdkDistributionState[distributionState.adspotId].percentageList && sdkDistributionState[distributionState.adspotId].percentageList[0].trafficGroupList.every(trafficGroup => trafficGroup.targetPercentageStrategyList.length == 1);

  return (<>
    {sdkDistributionState[distributionState.adspotId] ? <Spin spinning={loading}><ProCard split="horizontal" ghost>
      {
        isNotWaterfall ? <Tabs
          type='card'
          className={[styles['percentage-group-tab']].join(' ')}
          destroyInactiveTabPane
          tabBarStyle={abTesting ? {} : { display: 'none' }}
          onTabClick={(key) => {
            const [currentTargetId, currentPercentageId] = key.split('_')[0].split('-');
            distributionDispatcher.setCurrentTargetId(currentTargetId);
          }}
          items={
            // 这个是 流量分组的 ab 测试
            sdkDistributionState[distributionState.adspotId].percentageList?.filter(percentageGroup => percentageGroup.trafficPercentage.status).map(percentageGroup => ({
              key: percentageGroup.trafficGroupList[0].groupStrategy.groupTargetId + '-' + percentageGroup.trafficPercentage.percentageId,
              label: (
                <>
                  {`${percentageGroup.trafficPercentage.tag}: ${percentageGroup.trafficPercentage.percentage}%`}
                  {percentageGroup.trafficGroupList.every(item => item.targetPercentageStrategyList[0].suppliers.some(innerSuppliers => !innerSuppliers.length) || percentageGroup.trafficGroupList.every(item => !item.targetPercentageStrategyList[0].suppliers.length))
                    ? <Tooltip title={'该测试分组未启用任何广告源暂不生效，流量将分配到其他有可用广告源的测试分组。请先在该测试分组上配置启用的广告源'} placement={'right'}><ExclamationCircleFilled style={{ color: 'red', marginLeft: '10px' }} /></Tooltip>
                    : <></>
                  }
                </>
              ),
              children: <PercentageGroup
                group={percentageGroup}
                adspotId={distributionState.adspotId}
                onDelete={(targetingGroupId) => { deleteTargetingGroup(percentageGroup.trafficPercentage.percentageId, targetingGroupId); }}
                abTesting
              >
                {(trafficGroup) => (<>
                  <TargetingGroupInfo />
                  <ProCard className={styles['toolbar-button-container']}>
                    <Dropdown
                      overlay={<Menu
                        items={[
                          {
                            key: 'createOneSdkChannel',
                            label: (<div onClick={() => setVisible(true)}><FileTextOutlined />添加SDK广告源</div>)
                          },
                          {
                            key: 'batchCreationSdkChannel',
                            label: (<div onClick={() => setBatchCreationVisible(true)}><SnippetsOutlined />批量添加SDK广告源</div>)
                          },
                        ]}
                      />}
                      overlayClassName={styles['create-button-dropdown']}  
                    >
                      <Button type='primary'>
                          添加SDK广告源<DownOutlined />
                      </Button>
                    </Dropdown>
                    <div className={styles['setting-right-container']}>
                      <Setting />
                      <TimeType adspotId={distributionState.adspotId}/>
                    </div>
                  </ProCard>
                  {sdkAdspotChannelState.list.length ? <DragSuppliersTable 
                    adspotId={distributionState.adspotId}
                    mediaId={distributionState.mediaId}
                    percentageGroupId={percentageGroup.trafficPercentage.percentageId}
                    trafficId={trafficGroup.targetPercentageStrategyList[0].trafficId}
                    sdkSuppliers={trafficGroup.targetPercentageStrategyList[0].sdkSuppliers}
                    setLoading={setLoading}
                  /> : !loading && <EmptyImg text='暂无正在分发的广告源，请点击【添加】按钮添加SDK广告源'/>}
                </>)}
              </PercentageGroup>
            })) 
          }
        /> : <Tabs
          type='card'
          className={styles['percentage-group-tab-waterfall'] }
          destroyInactiveTabPane
          tabBarStyle={abTesting ? {} : { display: 'none' }}
          items={
            // 这个是 瀑布流的 ab 测试
            sdkDistributionState[distributionState.adspotId].percentageList?.map((percentageGroup, index) => ({
              key: percentageGroup.trafficPercentage.percentageId + '',
              label: <></>,
              children: (<PercentageGroupByWaterfall
                group={percentageGroup}
                adspotId={distributionState.adspotId}
                onDelete={(targetingGroupId) => { deleteTargetingGroup(percentageGroup.trafficPercentage.percentageId, targetingGroupId); }}
                abTesting
              >
                {(trafficGroup) => (<>
                  <TargetingGroupInfo />
                  <AbTestByWaterfall 
                    targetPercentageStrategyList={trafficGroup.targetPercentageStrategyList.filter(targetPercentage => targetPercentage.targetPercentage.status) || []}
                  >
                    {(targetPercentage) => (<>
                      <ProCard className={styles['toolbar-button-container']}>
                        <Dropdown
                          overlay={<Menu
                            items={[
                              {
                                key: 'createOneSdkChannel',
                                label: (<div onClick={() => setVisible(true)}><FileTextOutlined />添加SDK广告源</div>)
                              },
                              {
                                key: 'batchCreationSdkChannel',
                                label: (<div onClick={() => setBatchCreationVisible(true)}><SnippetsOutlined />批量添加SDK广告源</div>)
                              },
                            ]}
                          />}
                          overlayClassName={styles['create-button-dropdown']}  
                        >
                          <Button type='primary'>
                              添加SDK广告源<DownOutlined />
                          </Button>
                        </Dropdown>
                        <div className={styles['setting-right-container']}>
                          <Setting />
                          <TimeType adspotId={distributionState.adspotId}/>
                        </div>
                      </ProCard>
                      {sdkAdspotChannelState.list.length ? <DragSuppliersTable 
                        adspotId={distributionState.adspotId}
                        mediaId={distributionState.mediaId}
                        percentageGroupId={percentageGroup.trafficPercentage.percentageId}
                        trafficId={targetPercentage.trafficId}
                        sdkSuppliers={targetPercentage.sdkSuppliers}
                        setLoading={setLoading}
                      /> : !loading && <EmptyImg text='暂无正在分发的广告源，请点击【添加】按钮添加SDK广告源'/>}
                    </>)}
                  </AbTestByWaterfall>
                </>)}
              </PercentageGroupByWaterfall>)
            }))
          }
        />
      }
      
    </ProCard>
    
    <SdkAdspotChannelForm 
      model={formatModalDataFromPayload(newSdkAdspotChannel)}
      adspotId={distributionState.adspotId}
      mediaId={distributionState.mediaId}
      visible={visible} 
      isEditing={false}
      cancel={(isSubmit?) => {
        setVisible(false);
        isSubmit && submitForm();
      }}
    />

    <BatchCreationSdkChannelFormMoadl
      batchCreationVisible={batchCreationVisible}
      onCancel={() => setBatchCreationVisible(false)}
      modal={[]}
      adspotId={distributionState.adspotId}
      mediaId={distributionState.mediaId}
      onFinish={(isSubmit?) => {
        setBatchCreationVisible(false); 
        isSubmit && submitForm();
      }}
    />

    <DataTargetForm />
    </Spin> : <Spin spinning={true} size="large" className={distributionStyles['distribution-spin-container']}/>}
  </>);
}

export default SdkDistribution;

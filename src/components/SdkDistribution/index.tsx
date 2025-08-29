import store from '@/store';
import { DownOutlined, ExclamationCircleFilled, FileTextOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Spin, Tabs } from 'antd';
import TargetingGroupInfo from './TargetingGroupInfo';
import styles from './index.module.less';
import PercentageGroup from './PercentageGroup';
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

  // 只有发送了请求sdkDistributionState[distributionState.adspotId]才会有数据
  useEffect(() => {
    if (distributionState.adspotId && sdkDistributionState[distributionState.adspotId] && sdkDistributionState[distributionState.adspotId].percentageList.length > 1) {
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

  return (<>
    {sdkDistributionState[distributionState.adspotId] ? <Spin spinning={loading}><ProCard split="horizontal" ghost>
      <Tabs
        type='card'
        className={styles['percentage-group-tab']}
        destroyInactiveTabPane
        tabBarStyle={abTesting ? {} : { display: 'none' }}
        items={
          sdkDistributionState[distributionState.adspotId].percentageList?.map(percentageGroup => ({
            key: percentageGroup.trafficPercentage.percentageId + '',
            label: (<>
              {
                percentageGroup.trafficGroupList.every(item => item.suppliers.some(innerSuppliers => !innerSuppliers.length))
                  ? <ExclamationCircleFilled style={{ color: '#f8b601' }} />
                  : <></>
              }
              {`${percentageGroup.trafficPercentage.tag}: ${percentageGroup.trafficPercentage.percentage}%`}
            </>),
            children: (<PercentageGroup   // 流量分组管理的那一行，渲染百分比下面的tab栏
              group={percentageGroup}
              adspotId={distributionState.adspotId}
              onDelete={(targetingGroupId) => { deleteTargetingGroup(percentageGroup.trafficPercentage.percentageId, targetingGroupId); }}
              abTesting
            >
              {(trafficGroup) => (<>
                {/* 规则后面的定向组件 */}
                <TargetingGroupInfo groupStrategy={trafficGroup.groupStrategy}/>
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
                  trafficId={trafficGroup.trafficId}
                  sdkSuppliers={trafficGroup.sdkSuppliers}
                  setLoading={setLoading}
                /> : !loading && <EmptyImg text='暂无正在分发的广告源，请点击【添加】按钮添加SDK广告源'/>}
              </>)}
            </PercentageGroup>)
          }))
        }
      />
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

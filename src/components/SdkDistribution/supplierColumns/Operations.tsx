import { Popconfirm, Space, Switch } from 'antd';
import { useState } from 'react';
import store from '@/store';
import SdkAdspotChannelForm from '@/components/SdkDistribution/modals/SdkAdspotChannelForm';
import styles from './index.module.less';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import sdkChannelService from '@/services/sdkChannel';
import { getLocalDateType } from '../utils';
import { channelSource } from '../modals/sdkAutoAdspot/utils';

const sdkAdspotChannelDispatcher = store.getModelDispatchers('sdkAdspotChannel');
const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');

function Operation({
  adspotId,
  mediaId,
  model,
  innerWaterfallValue,
  innerBiddingValue,
  setInnerWaterfallValue,
  setInnerBiddingValue,
  onSubmit,
  setLoading
}: {
  adspotId: number,
  mediaId: number | undefined,
  model: ISdkAdspotChannel,
  innerWaterfallValue: number[][],
  innerBiddingValue: number[][],
  setInnerWaterfallValue: (value: number[][]) => void,
  setInnerBiddingValue: (value: number[][]) => void,
  onSubmit: (sdkSupplierMap: any) => void,
  setLoading: (value: boolean) => void
}) {
  // const sdkAdspotChannelState = store.useModelState('sdkAdspotChannel');
  const distributionState = store.useModelState('distribution');
  const adspot = store.useModelState('adspot');

  const [visible, setVisible] = useState(false);
  const [modalData, setModalData] = useState<ISdkAdspotChannel>();

  const adspotType = adspot.map[adspotId]?.adspotType || 0;

  const filterDistributionGroup = () => {
    // 如果为false
    const inWatefall = innerWaterfallValue.flat(2).findIndex(group => group === model.id);
    if (inWatefall == -1) {
      // 竞价组
      innerBiddingValue.forEach(group => {
        group.forEach((bidding, index) => {
          if (bidding === model.id) {
            group.splice(index, 1);
          }
        });
      });
      const newBiddingValue = innerBiddingValue.filter(item => item.length);
      setInnerBiddingValue(newBiddingValue);
    } else {
      // 固价组
      innerWaterfallValue.forEach(group => {
        group.forEach((waterfall, index) => {
          if (waterfall === model.id) {
            group.splice(index, 1);
          }
        });
      });
      const newWaterfallValue = innerWaterfallValue.filter(item => item.length);
      setInnerWaterfallValue(newWaterfallValue);
    }
  };

  const onChange = (status) => {
    if (status) {
      // 如果为true
      if (model.isHeadBidding) {
        innerBiddingValue[0].push(model.id);
        const newValue = [...innerBiddingValue];
        setInnerBiddingValue(newValue);
      } else {
        innerWaterfallValue[innerWaterfallValue.length -1].push(model.id);
        const newValue = [...innerWaterfallValue];
        setInnerWaterfallValue(newValue);
      }
      onSubmit({biddingValue: innerBiddingValue, waterfallValue: innerWaterfallValue});
    } else {
      filterDistributionGroup();
      onSubmit({biddingValue: innerBiddingValue, waterfallValue: innerWaterfallValue});
    }
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    // 旧数据使用老接口，新数据使用三方接口
    if (model.isAutoCreate) {
      const data = await sdkAdspotChannelDispatcher.getAutoAdspotSdkChannel({adspotId, sdkAdspotChannelId: model.id, adspotType, source: channelSource[model.adnId]});
      setModalData(formatModalDataFromPayload(data));
      setVisible(true);
    } else {
      const data = await sdkChannelService.getSdkAdspotChannel({adspotId, sdkAdspotChannelId: model.id});
      setModalData(formatModalDataFromPayload(data.sdkChannel));
      setVisible(true);
    }
  };

  return (<>
    <Switch
      size="small"
      checked={!![...innerWaterfallValue, ...innerBiddingValue].flat(2).find(item => item === model.id)}
      onChange={(newStatus) => onChange(newStatus)}
    />
    <Space size={8} style={{marginLeft: '10px', verticalAlign: 'middle', fontSize: '12px'}}>
      <a onClick={async (e) => handleEdit(e)}>编辑</a>
      <Popconfirm
        title={
          <>
            <p>确认删除后所有流量分组下的此广告源都将被删除
              {/* ，当前广告源正在{sdkAdspotChannelState.deleteSupplierStatus.count}个流量分组中进行分发 */}
            </p>
            {/* <p>正在分发的分组：
              {
                sdkAdspotChannelState.deleteSupplierStatus.groupList.length 
                  ? ( sdkAdspotChannelState.deleteSupplierStatus.groupList.map((item, index) => (<Fragment key={item + index}>
                    {
                      index
                        ? <Divider
                          type="vertical"
                          style={{ border: '1px solid #ccc' }}
                        />
                        : ''
                    }
                    <Text className={styles['ad-info']}>{item}</Text>
                  </Fragment>))) 
                  : (<>-</>)
              }
            </p> */}
          </>
        }
        okText="确定"
        cancelText="取消"
        placement='topLeft'
        onConfirm={async () => {
          filterDistributionGroup();
          await sdkAdspotChannelDispatcher.delete({ sdkAdspotChannelId: model.id, adspotId });
        }}
        disabled={model.channelId === 1 || model.channelId === 99}
        className={model.channelId === 1 || model.channelId === 99 ? styles['distribution-disabled'] : ''}
      >
        <a 
          onClick={async(e) => {
            // await sdkAdspotChannelDispatcher.getDeleteSdkAdspotChannelStatus({ sdkAdspotChannelId: model.id, adspotId });
          }}
        >删除</a>
        <br/>
      </Popconfirm>
    </Space>
    <SdkAdspotChannelForm 
      model={modalData}
      isEditing={true}
      adspotId={adspotId} 
      visible={visible} 
      cancel={(isSubmit?) => {
        setVisible(false); 
        if (isSubmit) {
          setLoading(true);
          const localDateType = getLocalDateType();
          const dateType = localDateType ? localDateType : distributionState.time;
          sdkDistributionDispatcher.queryAdspotSdkDistribution({ adspotId, dateType }).then(() => setLoading(false));
        }
      }}
      mediaId={mediaId}
    />
  </>);
}

export default Operation;

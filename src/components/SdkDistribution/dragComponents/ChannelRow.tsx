import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import store from '@/store';
import { HolderOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import { DraggableProvided } from 'react-beautiful-dnd';
import { columnWidth } from '../utils';
import SdkChannelPrice from '../supplierColumns/Price';
import SdkChannelName from '../supplierColumns/Name';
import SdkChannelOperation from '../supplierColumns/Operations';
import SdkChannelCount from '../supplierColumns/Count';
import styles from './index.module.less';

type Iprops = {
  channelDragProvided?: DraggableProvided,
  sdkAdspotChannel: ISdkAdspotChannel,
  groupIndex: number,
  isDistribution?: boolean,
  adspotId: number,
  mediaId: number | undefined,
  innerWaterfallValue: number[][],
  innerBiddingValue: number[][],
  setInnerWaterfallValue: (value: number[][]) => void,
  setInnerBiddingValue: (value: number[][]) => void,
  onSubmit: (sdkSupplierMap: any) => void,
  setLoading: (value: boolean) => void
};

export default function ChannelRow({
  channelDragProvided,
  sdkAdspotChannel,
  groupIndex,
  isDistribution,
  adspotId,
  mediaId,
  innerWaterfallValue,
  innerBiddingValue,
  setInnerWaterfallValue,
  setInnerBiddingValue,
  onSubmit,
  setLoading
}: Iprops) {
  const distributionState = store.useModelState('distribution');

  return (<Row align='middle' wrap={false} className={styles['channel-row-container']}>
    <Col span={8} className={styles['fixed-col']} id='outer-left-fixed'>
      {isDistribution ? <Col flex={columnWidth.priority} style={{textAlign: 'center'}}>{'-'}</Col> 
        : <Col flex={columnWidth.priority} style={{fontSize: '12px'}}>
          <Button
            {...channelDragProvided?.dragHandleProps}
            type="text"
            icon={<HolderOutlined />}
          />
          {groupIndex + 1}
        </Col>}
      <Col flex={columnWidth.name} style={{zIndex: 2}}>
        <SdkChannelName model={sdkAdspotChannel} />
      </Col>
      <Col flex={columnWidth.price} style={{zIndex: 2}}>
        <SdkChannelPrice model={sdkAdspotChannel} />
      </Col>
      <Col flex={columnWidth.operation} style={{zIndex: 2}}>
        <SdkChannelOperation
          model={sdkAdspotChannel} 
          adspotId={adspotId} 
          mediaId={mediaId} 
          innerWaterfallValue={innerWaterfallValue}
          innerBiddingValue={innerBiddingValue}
          setInnerWaterfallValue={(value: number[][]) => setInnerWaterfallValue(value)}
          setInnerBiddingValue={(value: number[][]) => setInnerBiddingValue(value)}
          onSubmit={onSubmit}
          setLoading={(value) => setLoading(value)}
        />
      </Col>
    </Col>
    <Col span={16} className={styles['scroll-col']} id='outer-right-col'>
      {
        distributionState.distributionDataTarget.length ? distributionState.distributionDataTarget.map(item => (<Col key={item} flex={columnWidth[item]}>
          <SdkChannelCount model={sdkAdspotChannel} param={item} />
        </Col>)) : <div style={{width: '100%', height: '48px', border: '1px solid #ebebeb', backgroundColor: '#fff'}}></div>
      }
    </Col>
  </Row>);
}

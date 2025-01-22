import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { sdkSuppliers } from '@/models/types/sdkDistribution';
import store from '@/store';
import { Col, Row, Typography, Image } from 'antd';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult, BeforeCapture } from 'react-beautiful-dnd';
import ChannelHeader from './dragComponents/ChannelHeader';
import ChannelRow from './dragComponents/ChannelRow';
import styles from './index.module.less';
import biddingTitle from '@/assets/icons/distribution/biddingTitle.png';
import fixedPrice from '@/assets/icons/distribution/fixedPrice.png';
import { columnWidth } from './utils';
import EmptyImg from './modals/EmptyImg';

const { Paragraph, Text } = Typography;

type Props = {
  adspotId: number,
  mediaId: number | undefined,
  percentageGroupId?: number,
  trafficId?: number,
  sdkSuppliers: sdkSuppliers,
  setLoading: (value: boolean) => void
};

const cloneValue = (value: number[][]) => (value.map(item => [...item]));
const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');

function DragSuppliersTable({ adspotId, mediaId, percentageGroupId, trafficId, sdkSuppliers, setLoading }: Props) {
  // 获取到的参与分发的数组id
  const [innerWaterfallValue, setInnerWaterfallValue] = useState<number[][]>([]);
  const [innerBiddingValue, setInnerBiddingValue] = useState<number[][]>([]);
  const { list: sdkAdspotChannelList,  map: sdkAdspotChannelMap } = store.useModelState('sdkAdspotChannel');

  useEffect(() => {  // 防止报错， 设置innerWaterfallValue
    setInnerBiddingValue(cloneValue(sdkSuppliers.bidding));
    setInnerWaterfallValue(cloneValue(sdkSuppliers.waterfall));
  }, [sdkSuppliers]);

  // 参与分发的竞价组
  const biddingGroup = useMemo(() => {
    return innerBiddingValue.map(group => group.map(supplierId => sdkAdspotChannelMap[supplierId]));
  }, [innerBiddingValue, sdkAdspotChannelMap]);

  // 通过innerWaterfallValue获取全部参与分发的固价组
  const distribution = useMemo(
    () => innerWaterfallValue.map(group => group.map(supplierId => sdkAdspotChannelMap[supplierId])),
    [innerWaterfallValue, sdkAdspotChannelMap]
  );

  //  通过innerWaterfallValue与innerBiddingValue获取未参与分发的组
  const unusedSdkAdspotChannels = useMemo(() => {
    const flatInnerValue = new Set([...innerWaterfallValue.flat(2), ...innerBiddingValue.flat(2)]);
    return sdkAdspotChannelList.filter(item => !flatInnerValue.has(item.id));
  }, [innerWaterfallValue, innerBiddingValue, sdkAdspotChannelList]);
  
  // 如果A,b,c,d,e...的子项分组id与下面的分组信息列表不存在的话返回空页面
  if (!percentageGroupId || !trafficId) {
    return <></>;
  }
  
  // 去除空数组
  const setInnerWaterfallValueWithoutEmptyGroup = (value: number[][]) => {
    let newValue = cloneValue(value || innerWaterfallValue);
    newValue = newValue.filter(item => item.length !== 0);
    setInnerWaterfallValue(newValue);
  };

  const setInnerBiddingValueWithoutEmptyGroup = (value: number[][]) => {
    let newValue = cloneValue(value || innerBiddingValue);
    newValue = newValue.filter(item => item.length !== 0);
    setInnerBiddingValue(newValue);
  };

  // 在捕获前  在落下前，整个空数组在外面
  const onBeforeCapture = (before: BeforeCapture) => {
    if (before.draggableId.startsWith('channel')) {
      setInnerWaterfallValue([...cloneValue(innerWaterfallValue), []]);
    }
  };

  // 在拖拽结束后  也就是子项item放下后
  const onDragEnd = (result: DropResult) => {
    const newWaterfallValue = cloneValue(innerWaterfallValue);
    const newBiddingValue = cloneValue(innerBiddingValue);
    // result.destination: {droppableId: '2', index: 1} 如果不存在目标对象，返回之前的数组结构innerWaterfallValue
    if (!result.destination) {
      setInnerWaterfallValueWithoutEmptyGroup(newWaterfallValue);
      setInnerBiddingValueWithoutEmptyGroup(newBiddingValue);
      return;
    }

    const type = result.type as 'CHANNEL' | 'BIDDING';

    if (type === 'CHANNEL') { // move channel  取到源组里的数据，源数组里给它删了，新组里给它加上
      const source = newWaterfallValue[+result.source.droppableId][result.source.index];
      newWaterfallValue[+result.source.droppableId].splice(result.source.index, 1);
      newWaterfallValue[+result.destination.droppableId].splice(result.destination.index, 0, source);
    } else if (type === 'BIDDING') {
      const source = newBiddingValue[+result.source.droppableId][result.source.index];
      newBiddingValue[+result.source.droppableId].splice(result.source.index, 1);
      newBiddingValue[+result.destination.droppableId].splice(result.destination.index, 0, source);
    } else {
      const _exhaustiveCheck: never = type;
      console.log(_exhaustiveCheck);
    }
    
    setInnerWaterfallValueWithoutEmptyGroup(newWaterfallValue);
    setInnerBiddingValueWithoutEmptyGroup(newBiddingValue);
    onSubmit({biddingValue: newBiddingValue, waterfallValue: newWaterfallValue});
  };

  const onSubmit = async ({biddingValue, waterfallValue}: {biddingValue: number[][], waterfallValue: number[][]}) => {
    const newBiddingValue = biddingValue.filter(item => item.length);
    const newWaterfallValue = waterfallValue.filter(item => item.length);
    const sdkSupplierMap = {
      bidding: JSON.stringify(newBiddingValue.length ? newBiddingValue : [[]]),
      waterfall:  JSON.stringify(newWaterfallValue.length ? newWaterfallValue : [[]])
    };
    setLoading(true);
    const data = await sdkDistributionDispatcher.updateSuppliers({
      adspotId,
      trafficId,
      sdkSupplierMap
    });
    if (data) {
      setLoading(false);
    }
  };

  // 另一组的Droppable套Draggable  传进来的数组结构中的每个一维数组item
  const DroppableGroup = ({ group,groupIndex,type }: {group: ISdkAdspotChannel[], groupIndex: number, type: string }) => (<Droppable
    droppableId={groupIndex + ''}
    type={type}
  >
    {(channelDropProvided) => (
      <div
        className={[styles['draggable-channels-container'], type === 'CHANNEL' ? '' : styles['draggable-bidding-container']].join(' ')}
        {...channelDropProvided.droppableProps}
        ref={channelDropProvided.innerRef}
      >
        <DraggableChannels
          group={group}
          groupIndex={groupIndex}
          type={type}
        />
        {channelDropProvided.placeholder}
      </div>
    )}
  </Droppable>);

  const DraggableChannels = ({
    group,
    groupIndex,
    type
  }: {
    group: ISdkAdspotChannel[],
    groupIndex: number
    type: string
  }) => (<>
    {group.map((sdkAdspotChannel, index) => (
      <Draggable
        key={sdkAdspotChannel.id}
        draggableId={(type === 'CHANNEL' ? 'channel' : 'bidding') + sdkAdspotChannel.id}
        index={index}
      >
        {(channelDragProvided) => (
          <div
            key={sdkAdspotChannel.id}
            ref={channelDragProvided.innerRef}
            {...channelDragProvided.draggableProps}
          >
            <div className={styles['draggable-channel']}>
              <ChannelRow
                channelDragProvided={channelDragProvided}
                sdkAdspotChannel={sdkAdspotChannel}
                groupIndex={groupIndex}
                adspotId={adspotId} 
                mediaId={mediaId} 
                innerWaterfallValue={innerWaterfallValue}
                innerBiddingValue={innerBiddingValue}
                setInnerWaterfallValue={(value: number[][]) => setInnerWaterfallValue(value)}
                setInnerBiddingValue={(value: number[][]) => setInnerBiddingValue(value)}
                onSubmit={onSubmit}
                setLoading={(value) => setLoading(value)}
              />
            </div>
          </div>)}
      </Draggable>
    ))}
  </>);

  // 固价组
  const DraggbleGroups = () => (<>
    {distribution.map((group, groupIndex) => (<Fragment key={groupIndex + '' }>
      <Paragraph className={styles['unused-channel-title']}>
        <Image src={fixedPrice} style={{width: '14px', height: '14px', marginRight: '5px', marginTop: '-2px'}} preview={false} />
        固价层 - <Text type="secondary">请求优先级:</Text> {groupIndex + 1}
      </Paragraph>
      <Row 
        align='middle' 
        key={groupIndex + ''} 
        style={{overflow: 'auto hidden', backgroundColor: '#fff', position: 'relative'}}
        id='fixed-price-drag-channel'
      >
        <Col
          flex={columnWidth.groupDroppable}
        >
          <ChannelHeader/>
          <DroppableGroup
            group={group}
            groupIndex={groupIndex}
            type={'CHANNEL'}
          />
        </Col>
      </Row>
    </Fragment>))}
  </>);
  
  // 竞价组
  const BiddingGroup = () => (<>
    {biddingGroup.map((group, groupIndex) => (<Fragment key={groupIndex + ''}>
      <Paragraph className={styles['unused-channel-title']}>
        <Image src={biddingTitle} style={{width: '14px', height: '14px', marginRight: '5px', marginTop: '-2px'}} preview={false} />
        竞价层 - <Text type="secondary">请求优先级:</Text> {groupIndex + 1}
      </Paragraph>
      <Row 
        align='middle' 
        key={groupIndex + ''}
        style={{overflow: 'auto hidden'}}
        id='bidding-drag-channel'
      >
        <Col
          flex={columnWidth.groupDroppable}
        >
          <ChannelHeader/>
          <DroppableGroup
            group={group}
            groupIndex={groupIndex}
            type={'BIDDING'}
          />
        </Col>
      </Row>
    </Fragment>) )}
  </>);

  // 未参与分发组
  const UnusedChannels = () => (<div className={styles['unused-channels-container']} id='unused-channels'>
    <ChannelHeader/>
    {
      unusedSdkAdspotChannels.map((item, index) => {
        return (<div className={styles['unused-channels-item']} key={index + '-' + item.id}>
          <ChannelRow
            sdkAdspotChannel={item}
            groupIndex={-1}
            adspotId={adspotId} 
            mediaId={mediaId} 
            innerWaterfallValue={innerWaterfallValue}
            innerBiddingValue={innerBiddingValue}
            setInnerWaterfallValue={(value: number[][]) => setInnerWaterfallValue(value)}
            setInnerBiddingValue={(value: number[][]) => setInnerBiddingValue(value)}
            onSubmit={onSubmit}
            setLoading={(value) => setLoading(value)}
            isDistribution={true}
          />
        </div>);
      })
    }
  </div>);

  // 如果拖拽列表不在一个数组，需要分开，分别用DragDropContext包裹哦，如果是同一个DragDropContext，就算Droppable的type不一样也不行
  return (<>
    <DragDropContext
      onDragEnd={onDragEnd}
      onBeforeCapture={onBeforeCapture}
    >
      <Droppable droppableId='drag' type="DRAG">
        {(groupDropProvided) => (
          <div
            ref={groupDropProvided.innerRef}
            {...groupDropProvided.droppableProps}
            className={styles['droppable-container']}
          >
            {/* 网络请求存在延迟情况，会导致map数组没有更新，这时候通过map取到的值就是undefined，所以需要把!==undefined的情况也判断上 */}
            {biddingGroup.length ? biddingGroup[0].length && biddingGroup[0][0] !== undefined ? <BiddingGroup /> : <></> : <></>}
            {groupDropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    <DragDropContext
      onDragEnd={onDragEnd}
      onBeforeCapture={onBeforeCapture}
    >
      <Droppable droppableId='group' type="GROUP">
        {(groupDropProvided) => (
          <div
            ref={groupDropProvided.innerRef}
            {...groupDropProvided.droppableProps}
            className={styles['droppable-container']}
          >
            {
              distribution.length && biddingGroup.length ? distribution[0].length || biddingGroup[0].length ? <></> : <EmptyImg text='暂无正在分发的广告源，请点击【开关】按钮设置广告源分发策略'/> : <></>
            }
            {distribution.length? distribution[0].length && distribution[0][0] !== undefined ? <DraggbleGroups /> : <></> : <></>}
            {groupDropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    {unusedSdkAdspotChannels.length ? <><Paragraph className={styles['unused-channel-title']}>
      未参与本组分发的广告源: {unusedSdkAdspotChannels.length}个
      <span style={{marginLeft: '100px'}}>打开状态开关启用广告源</span>
    </Paragraph><UnusedChannels /></> : <></>}
  </>);
}

export default DragSuppliersTable;

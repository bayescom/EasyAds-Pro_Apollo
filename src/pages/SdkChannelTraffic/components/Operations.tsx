import { Popconfirm, Space, Divider, Typography, Switch } from 'antd';
import { useState, Fragment } from 'react';
import store from '@/store';
import SdkAdspotChannelForm from '@/components/SdkDistribution/modals/SdkAdspotChannelForm';
import styles from '../index.module.less';
import { ISdkChannelTrafficList } from '@/models/types/sdkChannelTrafficList';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import sdkChannelService from '@/services/sdkChannel';
import { channelSource } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils';

const { Text } = Typography;

const sdkAdspotChannelDispatcher = store.getModelDispatchers('sdkAdspotChannel');

function Operation({
  adspotId,
  mediaId,
  model,
  onEditSubmit,
  changeStatus
}: {
  adspotId: number,
  mediaId: number | undefined,
  model: ISdkChannelTrafficList,
  onEditSubmit: () => void,
  changeStatus: (status : boolean) => void
}) {

  const [visible, setVisible] = useState(false);
  const [modalData, setModalData] = useState<ISdkChannelTrafficList>();

  const adspotType = model.adspotType;

  const onChangeStuatus = (status) => {
    changeStatus && changeStatus(status);
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    // 旧数据使用老接口，新数据使用三方接口
    if (model.isAutoCreate) {
      const data = await sdkAdspotChannelDispatcher.getAutoAdspotSdkChannel({adspotId, sdkAdspotChannelId: model.id, adspotType, source: channelSource[model.sdkChannelId]});
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
      checked={!!model.status}
      onChange={(newStatus) => onChangeStuatus(newStatus)}
    />
    <Space size={8} style={{marginLeft: '10px', verticalAlign: 'middle', fontSize: '12px'}} wrap>
      <a onClick={async (e) => handleEdit(e)}>编辑</a>
      <Popconfirm
        title={
          <>
            <p>确认删除后所有流量分组下的此广告源都将被删除
            </p>
          </>
        }
        okText="确定"
        cancelText="取消"
        placement='topLeft'
        onConfirm={async () => {
          await sdkAdspotChannelDispatcher.delete({ sdkAdspotChannelId: model.id, adspotId });
          onEditSubmit();
        }}
        disabled={model.sdkChannelId === 1 || model.sdkChannelId === 99}
        className={model.sdkChannelId === 1 || model.sdkChannelId === 99 ? styles['distribution-disabled'] : ''}
      >
        <a>删除</a>
        <br/>
      </Popconfirm>
    </Space>
    <SdkAdspotChannelForm 
      model={modalData}
      isEditing={true}
      adspotId={adspotId}
      currentAdspotType={adspotType}
      visible={visible} 
      cancel={(isSubmit?) => {
        setVisible(false); 
        if (isSubmit) {
          onEditSubmit();
        }
      }}
      mediaId={mediaId}
    />
  </>);
}

export default Operation;

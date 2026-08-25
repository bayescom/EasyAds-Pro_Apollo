import DefaultIcon from '@/assets/icons/channel/defaultIcon.png';
import ListPage from '@/components/Utils/ListPage';
import { Button, Drawer, Image } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { useEffect, useRef, useState } from 'react';
import SdkCustomerChannelForm from './SdkCustomerChannelForm';
import styles from './index.module.less';
import store from '@/store';
import { getEnabledPlatformLabels } from './utils';

const sdkCustomerChannelDispatcher = store.getModelDispatchers('sdkCustomerChannel');

type SdkCustomerChannelDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function SdkCustomerChannelDrawer({ open, onClose }: SdkCustomerChannelDrawerProps) {
  const sdkCustomerChannelState = store.useModelState('sdkCustomerChannel');
  const actionRef = useRef<ActionType>();
  const [formOpen, setFormOpen] = useState(false);
  const [modalData, setModalData] = useState<ISdkCustomerChannel>();
  const [isEditing, setIsEditing] = useState(false);
  const [metaReady, setMetaReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setMetaReady(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await Promise.all([
          sdkCustomerChannelDispatcher.getPlatformOptions(),
          sdkCustomerChannelDispatcher.getAdapterAdspotType(),
        ]);
      } catch {
        // 元数据加载失败也继续展示列表
      } finally {
        if (!cancelled) {
          setMetaReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open && metaReady) {
      actionRef.current?.reload();
    }
  }, [open, metaReady]);

  const closeForm = () => {
    setFormOpen(false);
    setIsEditing(false);
  };

  const columns: ProColumns<ISdkCustomerChannel>[] = [
    {
      title: '广告网络',
      dataIndex: 'name',
      search: false,
      render: (_value, record) => (
        <div className={styles['name-cell']}>
          <Image
            src={record.icon || DefaultIcon}
            style={{ width: '18px', height: 'auto' }}
            preview={false}
          />
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: '支持的平台类型',
      dataIndex: 'platforms',
      search: false,
      render: (_value, record) => getEnabledPlatformLabels(
        record.platforms,
        sdkCustomerChannelState.platformOptions
      ),
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      search: false,
      render: (_value, record) => (
        <a onClick={() => {
          setModalData(record);
          setIsEditing(true);
          setFormOpen(true);
        }}>编辑</a>
      ),
    },
  ];

  return (
    <>
      <Drawer
        open={open}
        width={700}
        title="管理自定义广告网络"
        className={styles['sdk-customer-channel-drawer']}
        destroyOnClose
        onClose={onClose}
      >
        <ListPage<ISdkCustomerChannel, Record<string, never>>
          columns={columns}
          className={styles['sdk-customer-channel-list']}
          manualRequest={!metaReady}
          request={async (params, sort) => ({
            ...await sdkCustomerChannelDispatcher.getList({ params, sort }),
            success: true,
          })}
          dataSource={sdkCustomerChannelState.list}
          actionRef={actionRef}
          search={false}
          sticky={{ offsetHeader: 0 }}
          headerTitle={
            <> <Button
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                setModalData(sdkCustomerChannelState.new);
                setIsEditing(false);
                setFormOpen(true);
              }}
            >
              + 自定义广告网络
            </Button>
            <a onClick={(e) => {
              window.open('https://www.bayescom.com/docsify/docs/#/advance/Blink3/traffic/customizedSdkChannel');
            }} className={styles['user-channel-link']}>了解如何使用自定义广告网络 </a></>
          }
        />
      </Drawer>

      <SdkCustomerChannelForm
        open={formOpen}
        editingItem={isEditing ? modalData : undefined}
        platformOptions={sdkCustomerChannelState.platformOptions}
        adapterOptions={sdkCustomerChannelState.adapterOptions}
        onClose={closeForm}
        onSave={(result) => {
          if (result) {
            actionRef.current?.reload();
            closeForm();
          }
        }}
      />
    </>
  );
}

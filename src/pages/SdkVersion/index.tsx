import { Button, Space, Switch } from 'antd';
import SpinOperation from '@/components/Utils/SpinOperation';
import store from '@/store';
import { ProFormInstance } from '@ant-design/pro-form';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { IMedium } from '@/models/types/medium';
import { useMemo, useRef, useState, Fragment } from 'react';
import mediumService from '@/services/medium';
import ListPage from '@/components/Utils/ListPage';
import { IAppVersion, VersionFilter } from '@/models/types/version';
import debounce from 'lodash/debounce';
import { SearchOutlined } from '@ant-design/icons';
import VersionMenu from '@/components/Menu';
import styles from './index.module.less';
import VersionForm from './components/Form';

type MediumFilterOption = {
  id: number,
  name: string,
  platformType: number;
};

const sdkVersionDispatcher = store.getModelDispatchers('sdkVersion');

function SdkVersion() {
  const sdkVersion  = store.useModelState('sdkVersion');

  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  const [mediumList, setMediumList] = useState<MediumFilterOption[]>([]);

  const [modalData, setModalData] = useState<IAppVersion>();
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useState(async () => {
    const data = await mediumService.getList({});   
    const currentMediumList = data.medias.map((item: IMedium) => ({
      id: item.id,
      name: item.mediaName,
      platform: item.platformType
    }));

    setMediumList(currentMediumList);
  });

  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 1000),
    []
  );

  const columns: ProColumns<IAppVersion>[] = [
    {
      title: '搜索',
      dataIndex: 'searchText',
      key: 'searchText',
      hideInTable: true,
      search: {
        transform: value => ({ searchText: value.trim() || undefined })
      },
      fieldProps: {
        onChange: submitFilterQuery,
        suffix: <SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />,
        placeholder:'请输入',
      },
      order: 10,
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      initialValue: -1,
      search: {
        transform: value => value === -1 ? {} : { status: value }
      },
      fieldProps: {
        onChange: () => formRef.current?.submit(),
        options: [
          { value: -1, label: '全部' },
          { value: 1, label: '打开' },
          { value: 0, label: '关闭' }
        ]
      }
    },
    {
      title: '操作',
      dataIndex: 'status',
      sorter: false,
      valueType: 'option',
      key: 'option',
      render: (dom, version) => (<Space size={[8, 0]} wrap>
        <a onClick={(e) => {
          e.stopPropagation();
          setVisible(true);
          setModalData(version);
          setIsEditing(true);
        }}>编辑</a>
      </Space>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: false,
      valueType: 'option',
      key: 'option',
      render: (dom, version, index) => (<Space size={[8, 0]} wrap>
        <SpinOperation>
          {(setLoading) => (
            <Switch
              size="small"
              checked={!!version.status}
              onChange={async (newStatus) => {
                setLoading(true);
                const data = {
                  ...version,
                  status: newStatus ? 1 : 0
                };
                await sdkVersionDispatcher.update(data);
                setLoading(false);
              }}
            />
          )}
        </SpinOperation>
      </Space>)
    }
  ];

  
  const close = () => {
    setVisible(false);
    setIsEditing(false);
  };

  return (
    <Fragment>
      <VersionMenu currentActive={'version_sdk'} />
      <ListPage<IAppVersion, VersionFilter>
        columns={columns}
        request={async (params, sort) => {
          return {
            ...await sdkVersionDispatcher.getList({ params, sort }), 
            success: true
          };
        }}
        dataSource={sdkVersion.list}
        formRef={formRef}
        actionRef={actionRef}
        size="small"
        className={styles['version-list']}
        sticky={{ offsetHeader: 52 }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        rowKey='id'
        headerTitle={
          <Button
            key='add'
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              setVisible(true);
              setIsEditing(false);
              setModalData(sdkVersion.new);
            }}>添加版本号</Button>
        }
        pagination={{showSizeChanger: sdkVersion.total > 10 ? true : false}}
      />
      <VersionForm
        mediumList={mediumList}
        open={visible}
        onClose={close}
        onFinish={() => {
          actionRef.current?.reload();
        }}
        isEditing={isEditing}
        modalData={modalData}
      />
    </Fragment>
  );
}

export default SdkVersion;

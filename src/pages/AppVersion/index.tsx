import { Button, Space, Typography, Tooltip, Switch } from 'antd';
import SpinOperation from '@/components/Utils/SpinOperation';
import store from '@/store';
import { ProFormInstance } from '@ant-design/pro-form';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { IMedium } from '@/models/types/medium';
import CopyableText from '@/components/CopyableText';
import { useMemo, useRef, useState, Fragment } from 'react';
import SearchSelect from '@/components/SearchSelect';
import mediumService from '@/services/medium';
import ListPage from '@/components/Utils/ListPage';
import { IAppVersion, VersionFilter } from '@/models/types/version';
import debounce from 'lodash/debounce';
import { Link } from 'ice';
import { SearchOutlined } from '@ant-design/icons';
import VersionMenu from '@/components/Menu';
import styles from './index.module.less';
import VersionForm from './components/Form';

const { Text } = Typography;

type MediumFilterOption = {
  id: number,
  name: string,
  platformType: number;
};

const appVersionDispatcher = store.getModelDispatchers('appVersion');

function AppVersion() {
  const appVersion  = store.useModelState('appVersion');

  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  const [modalData, setModalData] = useState<IAppVersion>();

  const [mediumList, setMediumList] = useState<MediumFilterOption[]>([]);

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

  const getCurrentMedia = (mediaId) => {
    return mediumList.find(item => item.id == mediaId);
  };

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
      dataIndex: 'mediaId',
      hideInTable: true,
      formItemProps: {
        className: styles['media-multiple-select'],
      },
      renderFormItem: () => (
        <SearchSelect
          name='mediaId'
          label='媒体'
          options={mediumList}
          valueKey='id'
          valueName='name'
          hasImage={true}
          hasPlatform={true}
          platformKey='platform'
          onChange={(value) => {
            submitFilterQuery();
          }}
        />
      ),
      order: 9
    },
    {
      title: '媒体',
      dataIndex: 'mediaId',
      valueType: 'select',
      hideInSearch: true,
      render: (dom, appVersion) => (
        <Space size={0} style={{width:'100%', display: 'flex'}} className={styles['chineseName-container']}>
          <Space direction="vertical" size={0}>
            <Tooltip title={mediumList.length && getCurrentMedia(appVersion.mediaId).name.length > 10 ? getCurrentMedia(appVersion.mediaId)?.name : false} placement='topLeft'>
              {mediumList.length && getCurrentMedia(appVersion.mediaId)?.name ? getCurrentMedia(appVersion.mediaId)?.name : '-'}
            </Tooltip>
            <div>
              <CopyableText
                text={appVersion.mediaId}
                nameInTooltip='媒体ID'
              >
                <Text type="secondary">{appVersion.mediaId}｜</Text>
              </CopyableText>
              <Link to={`/traffic/list/media/${appVersion.mediaId}/edit`}>查看</Link>
            </div>
          </Space>
        </Space>
      )
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
      render: (dom, version) => (<Space size={[8, 0]} wrap>
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
                await appVersionDispatcher.update(data);
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
      <VersionMenu currentActive={'version_app'} />
      <ListPage<IAppVersion, VersionFilter>
        columns={columns}
        request={async (params, sort) => {
          return {
            ...await appVersionDispatcher.getList({ params, sort }), 
            success: true
          };
        }}
        dataSource={appVersion.list}
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
              setModalData(appVersion.new);
            }}>添加版本号</Button>
        }
        pagination={{showSizeChanger: appVersion.total > 10 ? true : false}}
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

export default AppVersion;

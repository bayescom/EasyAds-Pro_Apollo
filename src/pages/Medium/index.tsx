import { Link, useHistory } from 'ice';
import { Image, Popconfirm, Space, Switch, Typography, Button, Tooltip, Menu, Dropdown } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import store from '@/store';
import { useLocation } from 'ice';
import { IMedium, IMediumListQueryPayload, MediumFilter } from '@/models/types/medium';
import SpinOperation from '@/components/Utils/SpinOperation';
import { useMemo, useRef, useState, useEffect } from 'react';
import { ProFormInstance } from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import ListPage from '@/components/Utils/ListPage';
import CopyableText from '@/components/CopyableText';
import BatchEditModal from './batchEditModal';
import BatchUncheckedTooltip from '@/components/BatchUncheckedTooltip';
import android from '@/assets/icons/media/android_app_icon.png';
import harmony from '@/assets/icons/media/harmony_app_icon.png';
import ios from '@/assets/icons/media/ios_app_icon.png';

const mediumDispatcher = store.getModelDispatchers('medium');
const { Text } = Typography;

export default function List() {
  const [codeState, codeDispatcher] = store.useModel('code');
  const medium = store.useModelState('medium');
  const formRef = useRef<ProFormInstance>();
  const history = useHistory();
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedRowArray, setSelectedRowArray] = useState<number[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<IMedium[]>([]);

  // 从报表跳转过来的媒体id
  const mediaId = useLocation().search.replace('?mediaId=', '');

  useEffect(() => {
    return () => {
      setSelectedRowArray([]);
      setSelectedDataSource([]);
      mediumDispatcher.setSelectedRowKeys([]);
    };
  }, []);

  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 500),
    []
  );

  const toCreateNewAdspot = (medium) => {
    history.push({ pathname: '/traffic/list/adspot/new' }, {
      mediumId: medium.id,
      mediumName: medium.mediaName
    });
  };

  const toAdspotList = (medium) => {
    history.push(`/traffic/adspot?mediaIds=${medium.id}`);
  };

  const columns: ProColumns<IMedium>[] = [
    {
      title: '搜索',
      dataIndex: 'searchText',
      key: 'searchText',
      hideInTable: true,
      initialValue: mediaId ? mediaId : undefined,
      search: {
        transform: value => ({ searchText: value.trim() || undefined })
      },
      fieldProps: {
        onChange: submitFilterQuery,
        suffix: <SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />
      }
    },
    {
      title: '平台类型',
      dataIndex: 'platform',
      valueType: 'select',
      hideInTable: true,
      request: async () => codeState.platform_type || await codeDispatcher.fetchCodeList(['platform_type', true]),
      fieldProps: {
        fieldNames: { label: 'name' },
        onChange: () => formRef.current?.submit()
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      initialValue: 1,
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
      title: '媒体',
      dataIndex: 'mediaName',
      search: false,
      render: (dom, medium) => (
        <Space size={0} style={{width:'100%', display: 'flex'}} className={styles['chineseName-container']}>
          <Image src={medium.platformType == 0 ? ios : medium.platformType == 1 ? android : harmony} preview={false} style={{width: '36px', height: 'auto', marginRight: '5px'}}/>
          <Space direction="vertical" size={0}>
            <Tooltip title={medium.mediaName.length > 11 ? medium.mediaName : false} placement='topLeft'>{medium.mediaName}</Tooltip>
            <Text type="secondary">
              <CopyableText text={`${medium.id}`} nameInTooltip='媒体ID'>
                {medium.id}
              </CopyableText>
            </Text>
          </Space>
        </Space>
      ),
      width: '25%'
    },
    {
      title: '平台类型',
      dataIndex: 'platformTypeName',
      search: false,
      render: (dom, medium) => (
        <Text>
          {medium.platformTypeName}
        </Text>
      ),
      width: '15%'
    },
    {
      title: '包名',
      dataIndex: 'bundleName',
      search: false,
      render: (dom, medium) => (
        <Text style={{overflowWrap: 'anywhere'}}>
          <CopyableText text={`${medium.bundleName}`} nameInTooltip='包名'>
            {medium.bundleName}
          </CopyableText>
        </Text>
      ),
      width: '20%'
    },
    {
      title: '关联广告位数量',
      dataIndex: 'adspotCount',
      search: false,
      render: (dom, medium) => (
        <Button type='link' onClick={() => toAdspotList(medium)} style={{padding: '0'}}>{medium.adspotCount}</Button>
      ),
      width: '15%',
      align: 'center'
    },
    {
      title: '操作',
      dataIndex: 'status',
      sorter: false,
      valueType: 'option',
      key: 'option',
      width: '240px',
      render: (dom, medium, index, actions) => (<Space size={[8, 0]} wrap className={medium.adspotCount !== 0 ? styles['media-list-option'] : ''}>
        <Link to={`/traffic/list/media/${medium.id}/edit`}>编辑</Link>
        {/* 跳转的时候添加了媒体参数 */}
        <Button type='link' onClick={() => toCreateNewAdspot(medium)} style={{padding: '0'}}>创建广告位</Button>

        {/* 跳转时添加媒体参数  */}
        <Button type='link' onClick={() => toAdspotList(medium)} style={{padding: '0'}}>查看广告位</Button>
        <Popconfirm
          title="确定要删除此媒体吗"
          placement='topLeft'
          onConfirm={async () => {
            await mediumDispatcher.delete({ id: medium.id, index });
            actions?.reload();
          }}
          overlayClassName={styles['delect-popconfirm-container']}
          disabled={medium.adspotCount !== 0}
        >
          <Tooltip title={medium.adspotCount !== 0 && '该媒体下有所关联的广告位，不能进行删除'}><a>删除</a></Tooltip>
        </Popconfirm>
      </Space>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: false,
      valueType: 'option',
      key: 'option',
      align: 'center',
      width: '10%',
      render: (dom, medium) => (<SpinOperation>
        {(setLoading) => (<>
          {
            medium.status ?
              <Popconfirm
                title="状态关闭后此媒体下的全部广告位也会同时关闭，将不可进行广告请求，确认关闭吗？"
                placement='topLeft'
                onConfirm={async () => {
                  setLoading(true);
                  await mediumDispatcher.updateStatus({ medium, status: +(!medium.status) });
                  setLoading(false);
                }}
                overlayClassName={styles['delect-popconfirm-container']}
              >
                <Switch size="small" checked={!!medium.status}/>
              </Popconfirm> 
              :
              <Switch
                size="small"
                checked={!!medium.status}
                onChange={async (newStatus) => {
                  setLoading(true);
                  await mediumDispatcher.updateStatus({ medium, status: +newStatus });
                  setLoading(false);
                }}
              />
          }
        </>
        )}
      </SpinOperation>)
    },
  ];

  const rowSelection = {
    selectedRowKeys: medium.selectedRowKeys,
    onChange: (selectedRowKeys, dataSource) => {
      setSelectedRowArray(selectedRowKeys);
      setSelectedDataSource(dataSource);
      mediumDispatcher.setSelectedRowKeys(selectedRowKeys);
    }
  };

  return (
    <>
      <ListPage<IMedium, MediumFilter>
        columns={columns}
        request={async (params, sort) => ({
          ...await mediumDispatcher.getList({ params, sort } as IMediumListQueryPayload), 
          success: true
        })}
        dataSource={medium.list}
        className={styles['media-list']}
        formRef={formRef}
        pathForCreate="/traffic/list/media/new"
        labelForCreate="媒体"
        sticky={{ offsetHeader: 52 }}
        size="small"
        tableAlertRender={false}
        rowKey='id'
        rowSelection={rowSelection}
      />

      <BatchEditModal
        editOpen={batchModalVisible}
        onClose={(bool) => {
          setBatchModalVisible(false);
          bool && formRef.current?.submit();
        }}
        selectedRowArray={selectedRowArray}
        selectedDataSource={selectedDataSource}
      />

      <div className={styles['batch-options-contianer']}>
        <BatchUncheckedTooltip isHideTooltip={!!selectedRowArray.length} title='当前暂无媒体被勾选，请先勾选，再进行操作'/>
        <Dropdown
          overlayClassName={styles['batch-button-dropdown']}
          overlay={<Menu
            items={[
              {
                key: 'createOneSdkChannel',
                label: (<div onClick={() => setBatchModalVisible(true)}>批量操作媒体状态</div>)
              }
            ]}
          />}
          disabled={!selectedRowArray.length}
          placement='bottomRight'
          overlayStyle={{minWidth: '128px'}}
        >
          <Button type='default'>批量操作<DownOutlined /></Button>
        </Dropdown>
      </div>
    </>
  );
}

import { IAdspot, IAdspotListQueryPayload, AdspotFilter } from '@/models/types/adspotList';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import store from '@/store';
import { Popconfirm, Space, Switch, Tooltip, Typography, Image, Button, Select, Empty, Input, Dropdown, Menu } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProFormInstance } from '@ant-design/pro-form';
import { Link, useHistory, useLocation } from 'ice';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import mediumService from '@/services/medium';
import SpinOperation from '@/components/Utils/SpinOperation';
import CopyableText from '@/components/CopyableText';
import ListPage from '@/components/Utils/ListPage';
import { maxTagPlaceholder } from '@/components/Utils';
import { IMedium } from '@/models/types/medium';
import styles from './index.module.less';
import mediumStyles from '@/pages/Medium/index.module.less';
import { getUrlParams } from '@/services/utils/utils';
import { CloseOutlined } from '@ant-design/icons';
import { maxTagPlaceholderForCustomSelect } from '@/components/Utils';
import BatchEditModal from './components/batchEditModal';
import BatchUncheckedTooltip from '@/components/BatchUncheckedTooltip';
import { mediaIconMap } from '@/components/Utils/Constant';

type MediumFilterOption = {
  id: number,
  name: string,
  url: string
};

const { Text } = Typography;
const { Option } = Select;
const reportMediumDispatcher = store.getModelDispatchers('reportMedium');

function Adspot() {
  const [adspot, adspotDispatcher] = store.useModel('adspotList');
  const [codeState, codeDispatcher] = store.useModel('code');
  const reportMedium  = store.useModelState('reportMedium');
  const [mediumList, setMediumList] = useState<MediumFilterOption[]>([]);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  const history = useHistory();

  // 从媒体表单跳转过来的, 或者从流量分发跳转过来的
  const state: { mediumId: string } = useLocation<{ mediumId: string }>().state;

  const [rightSelectList, setRightSelectList] = useState<any[]>([]);
  const mediaIds = formRef.current?.getFieldValue('mediaIds');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedRowArray, setSelectedRowArray] = useState<number[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<IAdspot[]>([]);
  
  useState(async () => {
    const data = await mediumService.getList({});   
    const currentMediumList = data.medias.map((item: IMedium) => ({
      id: item.id,
      name: item.mediaName,
      platform: item.platformType
    }));

    setMediumList(currentMediumList);
    setFilterOptions(currentMediumList);
  });

  useEffect(() => {
    return () => {
      setSelectedRowArray([]);
      setSelectedDataSource([]);
      adspotDispatcher.setSelectedRowKeys([]);
    };
  }, []);

  useEffect(() => {
    if (mediaIds) {
      const dataList = mediaIds.split(',');
      const newRightSelectList = dataList.map(item => {
        return mediumList.filter(listItem => listItem.id == item);
      });
      setRightSelectList(newRightSelectList.flat(2));
    } else {
      setRightSelectList([]);
    }
  }, [mediaIds, mediumList]);

  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 1000),
    []
  );

  const goEditPage = (adspotId) => {
    history.push(`/traffic/list/adspot/${adspotId}/edit`);
  };

  const goDistributionPage = (adspot) => {
    history.push({ pathname: '/traffic/distribution', search: `mediaId=${adspot.mediaId}&adspotId=${adspot.id}`}, {
      params: window.location.search
    });
  };

  const clearOption = (key) => {
    const newRightSelectList = [...rightSelectList];
    const index = newRightSelectList.findIndex(item => item.id == key);
    newRightSelectList.splice(index, 1);
    setRightSelectList(newRightSelectList);

    const newWatchFormItem = mediaIds.replace(key + '', '').replace(/,(?=,)/g, '').replace(/[&,]$/, '').replace(/^[&,]/, '');
    formRef.current?.setFieldValue('mediaIds', newWatchFormItem ? newWatchFormItem : undefined);
    submitFilterQuery();
  };

  const clearAll = () => {
    setRightSelectList([]);
    formRef.current?.setFieldValue('mediaIds', '');
    submitFilterQuery();
  };

  const handleSearch = (e) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = mediumList.filter(item => item.id.toString().includes(text)
       || item.name.toString().toLowerCase().includes(text.toLowerCase()));
      setFilterOptions(result);
    } else {
      setFilterOptions(mediumList);
    }
  };

  const handleCustomAll = () => {
    // 节流
    if (rightSelectList.length !== mediumList.length) {
      setRightSelectList(mediumList);
      const currentFormItemData = mediumList.map(item => item.id);
      currentFormItemData.length ? formRef.current?.setFieldValue('mediaIds', currentFormItemData.toString()) : formRef.current?.setFieldValue('mediaIds', undefined);
      submitFilterQuery();
    }
  };

  const handleCustomInvert = () => {
    if (rightSelectList.length) {
      if (rightSelectList.length !== mediumList.length) { 
        const currentSelect = mediaIds.split(',');
        const invertList = mediumList.filter(item => !currentSelect.includes(String(item.id)));
        const invertListValues = invertList.map(item => item.id);
        setRightSelectList(invertList);
        formRef.current?.setFieldValue('mediaIds', invertListValues.toString());
      } else {
        setRightSelectList([]);
        formRef.current?.setFieldValue('mediaIds', undefined);
      }
    } else {
      setRightSelectList(mediumList);
      const currentFormItemData = mediumList.map(item => item.id);
      currentFormItemData.length ? formRef.current?.setFieldValue('mediaIds', currentFormItemData.toString()) : formRef.current?.setFieldValue('mediaIds', undefined);
    }
    submitFilterQuery();
  };

  // 如果离开收益报表前，维度勾选有变，再次进入可能会出现一些展示问题，所以最好进入前重新赋值
  const goToReportMedium = (adspotId) => {
    reportMediumDispatcher.setTableParams({
      ...reportMedium.tableParams,
      dimensions: 'timestamp,mediaId'
    });
    history.push(`/data_report/media_report?adspotId=${adspotId}`);
  };

  const columns: ProColumns<IAdspot>[] = [
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
        placeholder:'请输入广告位名称或ID',
      },
      order: 10,
    },
    {
      title: '广告位状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      initialValue: getUrlParams(window.location.href).status ? Number(getUrlParams(window.location.href).status) : 1,

      fieldProps: {
        onChange: () => formRef.current?.submit(),
        options: [
          { value: -1, label: '全部' },
          { value: 1, label: '打开' },
          { value: 0, label: '关闭' }
        ]
      },
      formItemProps: {
        getValueProps: outerValue => ({ value: outerValue != undefined ? Number(outerValue) : null})
      },
      order: 7
    },
    {
      title: '广告位',
      dataIndex: 'adspotName',
      search: false,
      width: 300,
      render: (dom, adspot) => (
        <Space direction="vertical" size={0} style={{marginRight: '35px'}}>
          <Text>
            <Typography.Paragraph
              style={{marginBottom: '0px', wordBreak: 'break-all'}}
              ellipsis={{ rows: 2 }}
            >
              <Tooltip title={adspot.adspotName}>{adspot.adspotName}</Tooltip>
            </Typography.Paragraph>
          </Text>
          <CopyableText
            text={`${adspot.id}`}
            nameInTooltip="id"
          >
            <Text type="secondary">{adspot.id}</Text>
          </CopyableText>
        </Space>
      ),
    },
    {
      title: '广告位类型',
      dataIndex: 'adspotType',
      valueType: 'select',
      request: async () => codeState.layout || await codeDispatcher.fetchCodeList(['layout', true]),
      renderText: (text) => text === 0 ? '-' : text,
      fieldProps: {
        fieldNames: { label: 'name' },
        mode: 'multiple',
        maxTagCount: 'responsive',
        maxTagPlaceholder: maxTagPlaceholder,
        onChange: () => submitFilterQuery(),
        showArrow: true,
        showSearch: false
      },
      formItemProps: {
        getValueFromEvent: (values: string[]) => (values.map(item => Number(item)).join(',')),
        getValueProps: outerValue => ({ value: outerValue ? outerValue.split(',').map(item => Number(item)) : []})
      },
      order: 8,
      width: 150
    },
    {
      title: '媒体',
      dataIndex: 'mediaIds',
      hideInTable: true,
      formItemProps: {
        className: styles['media-multiple-select'],
        getValueFromEvent: (values: string[]) => (values.join(',')),
        getValueProps: (outerValue) => ({ value: outerValue ? outerValue.split(',') : []}),
      },
      fieldProps: {
        onChange: () => {
          if (mediaIds) {
            const dataList = mediaIds.split(',');
            const newRightSelectList = dataList.map(item => {
              return mediumList.filter(listItem => listItem.id == item);
            });
            setRightSelectList(newRightSelectList.flat(2));
          } else {
            setRightSelectList([]);
          }
          submitFilterQuery();
        },
      },
      initialValue: state && state.mediumId ? state.mediumId.toString() : null,
      renderFormItem: () => (
        <Select
          showSearch={false}
          allowClear
          mode="multiple"
          showArrow={true}
          placeholder="请选择"
          maxTagCount={rightSelectList.length > 1 ? 0 : 1}
          maxTagPlaceholder={(omittedValues) => maxTagPlaceholderForCustomSelect(omittedValues)}
          className={styles['select-option']}
          placement={'bottomLeft'}
          dropdownRender={(menu) => (<>
            {mediumList.length ? <div className={[styles['select-container'], styles['media-container']].join(' ')}>
              <div className={styles['left-container']}>
                <Input onChange={(e) => handleSearch(e)}
                  className={styles['custom-input']}
                  allowClear 
                  prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                  ref={input => input?.focus()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <p className={styles['custom-btn']}>
                  <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
                  <span className={styles['custom-btn-invert']} onClick={() => handleCustomInvert()}>反选</span>
                </p>
                {menu}
              </div>
              <div className={styles['right-container']}>
                <div className={styles['top-operation']}>
                  <span style={{color: '#545454'}}>已选：&nbsp;{rightSelectList.length}</span>
                  <a onClick={() => clearAll()}>清空全部</a>
                </div>
                <ul className={styles['show-select-container']}>
                  {
                    rightSelectList.length ? rightSelectList.map((item, index) => {
                      return ( <li key={`${item.name}_${index}`}>
                        <p>
                          {
                            item.name.length > 14 ? <Tooltip title={item.name} placement='right'>{item.name}</Tooltip>
                              : <>{item.name}</>
                          }
                        </p>
                        <span>{item.id}</span>
                        <span className={styles['clear-icon']} onClick={() => clearOption(item.id)}><CloseOutlined /></span>
                      </li>);
                    }) : <></>
                  }
                </ul>
              </div>
            </div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles['empty-container']}/>}
          </>
          )}
        >
          {filterOptions.map(item => (
            <Option key={item.id} value={item.id.toString()} label={item.name}>
              <Space size={0} style={{width:'100%', display: 'flex'}}>
                <Image src={mediaIconMap[item.platform]} preview={false} style={{width: '32px', height: 'auto', marginRight: '4px'}} />
                <Space direction="vertical" size={0}>
                  {
                    item.name.length > 10 ? <Tooltip title={item.name} placement='right'>{item.name}</Tooltip>
                      : <>{item.name}</>
                  }
                  <Text type="secondary">
                    {item.id}
                  </Text>
                </Space>
              </Space>
            </Option>
          ))}
        </Select>
      ),
      order: 9
    },
    {
      title: '媒体',
      dataIndex: 'mediaId',
      valueType: 'select',
      hideInSearch: true,
      render: (dom, adspot) => (
        <Space size={0} style={{width:'100%', display: 'flex'}} className={styles['chineseName-container']}>
          <Image src={mediaIconMap[adspot.platformType as number]} preview={false} style={{width: '36px', height: 'auto', marginRight: '5px'}}/>
          <Space direction="vertical" size={0}>
            <Tooltip title={adspot.mediaName.length > 10 ? adspot.mediaName : false} placement='topLeft'>
              {adspot.mediaName}
            </Tooltip>
            <div>
              <CopyableText
                text={adspot.mediaId}
                nameInTooltip='媒体ID'
              >
                <Text type="secondary">{adspot.mediaId}｜</Text>
              </CopyableText>
              <Link to={`/traffic/list/media/${adspot.mediaId}/edit`}>查看</Link>
            </div>
          </Space>
        </Space>
      ),
      width: 200
    },
    {
      title: '操作',
      valueType: 'option',
      width: 210,
      render: (dom, adspot, index, actions) => (<Space size={[8, 0]} wrap={false}>
        <a onClick={(e) => {e.stopPropagation(); goToReportMedium(adspot.id);}}>数据</a>
        <a onClick={(e) => {e.stopPropagation(); goEditPage(adspot.id);}}>编辑</a>
        {
          <a onClick={(e) => {e.stopPropagation(); goDistributionPage(adspot);}}>流量分发</a>
        }
        <Popconfirm
          title="确定要删除此广告位吗"
          placement='topLeft'
          onConfirm={async () => {
            await adspotDispatcher.delete({ id: adspot.id, index });
            actions?.reload();
          }}
          overlayClassName={styles['delect-popconfirm-container']}
        >
          <a>删除</a>
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
      width: 80,
      render: (dom, adspot) => (<SpinOperation>
        {(setLoading) => (<>
          {
            adspot.status ?
              <Popconfirm
                title="状态关闭后将不可进行广告请求，确认关闭吗？"
                placement='topLeft'
                onConfirm={async () => {
                  setLoading(true);
                  await adspotDispatcher.updateStatus({ adspot, status: !adspot.status});
                  setLoading(false);
                }}
                overlayClassName={styles['delect-popconfirm-container']}
              >
                <Switch size="small" checked={!!adspot.status}/>
              </Popconfirm>
              :
              <Switch
                size="small"
                checked={!!adspot.status}
                onChange={async (newStatus) => {
                  setLoading(true);
                  await adspotDispatcher.updateStatus({ adspot, status: newStatus });
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
    selectedRowKeys: adspot.selectedRowKeys,
    onChange: (selectedRowKeys, dataSource) => {
      setSelectedRowArray(selectedRowKeys);
      setSelectedDataSource(dataSource);
      adspotDispatcher.setSelectedRowKeys(selectedRowKeys);
    }
  };

  return (<div className={styles['adspot-list-container']}>
    <ListPage<IAdspot, AdspotFilter>
      columns={columns}
      request={async (params, sort) => {
        return {
          ...await adspotDispatcher.getList({ params, sort } as IAdspotListQueryPayload), 
          success: true
        };
      }}
      dataSource={adspot.list}
      formRef={formRef}
      actionRef={actionRef}
      size="small"
      className={styles['adspot-list']}
      sticky={{ offsetHeader: 52 }}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      rowKey='id'
      rowSelection={rowSelection}
      toolBarRender={() => [
        <Button
          key="primary"
          type="primary"
          onClick={() => {
            history.push('/traffic/list/adspot/new');
          }}
          className={styles['create-adspot-button']}
        >
          添加广告位
        </Button>,
        <BatchUncheckedTooltip isHideTooltip={!!selectedRowArray.length} title='当前暂无广告位被勾选，请先勾选，再进行操作' key='batchTooltip'/>,
        <Dropdown
          key='batchOptions'
          overlayClassName={mediumStyles['batch-button-dropdown']}
          overlay={<Menu
            items={[
              {
                key: 'createOneSdkChannel',
                label: (<div onClick={() => setBatchModalVisible(true)}>批量操作广告位状态</div>)
              }
            ]}
          />}
          disabled={!selectedRowArray.length}
          overlayStyle={{minWidth: '141px'}}
        >
          <Button type='default'>批量操作<DownOutlined /></Button>
        </Dropdown>
      ]}
      pagination={{showSizeChanger: adspot.total > 10 ? true : false}}
      form={{
        syncToUrl: true
      }}
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
  </div>
  );
}

export default Adspot;

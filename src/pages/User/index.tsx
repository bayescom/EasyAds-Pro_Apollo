import { Popconfirm, Space, Switch, Button } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import store from '@/store';
import { IUser, UserFilter, IUserListQueryPayload } from '@/models/types/user';
import SpinOperation from '@/components/Utils/SpinOperation';
import { useMemo, useRef, useState } from 'react';
import { ProFormInstance } from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import ListPage from '@/components/Utils/ListPage';
import { SearchOutlined } from '@ant-design/icons';
import UserForm from './form';
import styles from './index.module.less';
import PasswordForm from './passwordForm';

const userDispatcher = store.getModelDispatchers('user');

/** a 己方，b 对方 */
const contrastLevel = (a, b) => a <= b ? true : false;

export default function List() {
  const user = store.useModelState('user');
  const tokenState = store.useModelState('token');
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  const [modalData, setModalData] = useState<IUser>();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passWordmodalVisible, setPasswordModalVisible] = useState(false);
  const current = 0;

  const submitFilterQuery = useMemo(
    () => debounce(() => formRef.current?.submit(), 500),
    []
  );

  const columns: ProColumns<IUser>[] = [
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
        placeholder: '请输入登录名'
      }
    },
    {
      title: '角色',
      dataIndex: 'roleType',
      key: 'roleType',
      valueType: 'select',
      request: async () => await userDispatcher.getUserRoleType(tokenState.user.roleType),
      fieldProps: {
        fieldNames: { label: 'name' },
        onChange: () => formRef.current?.submit(),
        showArrow: true,
      },
      hideInTable: true,
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
      },
    },
    {
      title: '登陆名',
      dataIndex: 'userName',
      key: 'userName',
      search: false,
      width: '30%'
    },
    {
      title: '角色',
      dataIndex: 'roleTypeName',
      key: 'roleTypeName',
      search: false,
      width: '20%'
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      search: false,
      width: '30%'
    },
    {
      title: '操作',
      dataIndex: 'option',
      sorter: false,
      valueType: 'option',
      key: 'option',
      width: 240,
      render: (dom, user, index, actions) => (<Space size={[8, 0]} wrap className={styles['user-option']}>
        {contrastLevel(tokenState.user.roleType, user.roleType) ? <a onClick={(e) => {
          e.stopPropagation();
          setModalData(user);
          setPasswordModalVisible(true);
        }}>修改密码</a> : <span className={styles['disabled']}>修改密码</span>}
        {contrastLevel(tokenState.user.roleType, user.roleType) ? <a onClick={(e) => {
          e.stopPropagation();
          setModalVisible(true);
          setModalData(user);
          setIsEditing(true);
        }}>编辑</a> : <span className={styles['disabled']}>编辑</span>}
        {contrastLevel(tokenState.user.roleType, user.roleType) ? <Popconfirm
          title="确定要删除此用户吗"
          placement='topLeft'
          onConfirm={async () => {
            await userDispatcher.delete({ id: user.id as number, index });
            actions?.reload();
          }}
          overlayClassName={styles['delect-popconfirm-container']}
          disabled={tokenState.user.id == user.id}
        >
          <span className={tokenState.user.id == user.id ? styles['disabled'] : ''}>删除</span>
        </Popconfirm> : <span className={styles['disabled']}>删除</span>}
      </Space>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: false,
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (dom, user, index) => (<Space size={[8, 0]} wrap>
        <SpinOperation>
          {(setLoading) => (
            <Switch
              size="small"
              checked={!!user.status}
              onChange={async (newStatus) => {
                setLoading(true);
                await userDispatcher.updateStatus({ user, status: +newStatus });
                setLoading(false);
              }}
              disabled={!contrastLevel(current, index)}
            />
          )}
        </SpinOperation>
      </Space>)
    }
  ];

  const close = () => {
    setModalVisible(false);
    setIsEditing(false);
  };

  return (
    <>
      <ListPage<IUser, UserFilter>
        columns={columns}
        className={styles['user-form']}
        request={async (params, sort) => ({
          ...await userDispatcher.getList({ params: {...params, userRoleType: tokenState.user.roleType}, sort } as IUserListQueryPayload), 
          success: true
        })}
        dataSource={user.list}
        formRef={formRef}
        sticky={{ offsetHeader: 52 }}
        actionRef={actionRef}
        headerTitle={
          <Button
            key='add'
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              setModalVisible(true);
              setModalData(user.new);
              setIsEditing(false);
            }}>添加用户</Button>
        }
      />
      <UserForm
        user={modalData}
        visible={modalVisible}
        onClose={close}
        onFinish={() => {
          actionRef.current?.reload();
        }}
        isEditing={isEditing}
      />

      <PasswordForm
        user={modalData}
        visible={passWordmodalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onFinish={() => {
          actionRef.current?.reload();
        }}
      />
    </>
  );
}

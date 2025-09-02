import { ISdkChannel } from '@/models/types/channel';
import store from '@/store';
import { DeleteOutlined } from '@ant-design/icons';
import { FormListActionType, ModalForm, ProFormInstance, ProFormList, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Alert, Button, Col, Divider, Popconfirm, Row, Image } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { channelIconMap, autoCreateStatusTipMap, sdkReportApiChannels } from '@/components/Utils/Constant';
import { cloneDeep } from 'lodash';

const channelDispatcher = store.getModelDispatchers('channel');

function ChannelForm({
  channel,
  visible,
  onClose,
  onFinish,
}: {
  channel: ISdkChannel | undefined,
  visible: boolean,
  onClose: () => void,
  onFinish: () => void,
}) {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();
  const [sdkReportApiStatusMap, setSdkReportApiStatusMap] = useState<Record<number, { status: boolean, autoCreateStatus: boolean }>>();

  const resetForm = useCallback(() => {
    if (!channel) {
      return;
    }

    const sdkReportApiStatusMap = {};
    if (channel.reportApiParams.length) {
      channel.reportApiParams.forEach((ele, index) => {
        sdkReportApiStatusMap[index] = {
          status: !!ele.status,
          autoCreateStatus: !!ele.autoCreateStatus
        };
      });
      setSdkReportApiStatusMap(sdkReportApiStatusMap);
    } else {
      setSdkReportApiStatusMap({0: {status: true, autoCreateStatus: channel.supportAutoCreate ? true : false}});
    }
  }, [channel]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!channel) {
      return;
    }

    const defaultChannel = {...channel};
    defaultChannel.reportApiParams = channel.reportApiParams.length ? defaultChannel.reportApiParams : [{
      id: null,
      name: '',
      channelParams: {},
      status: 1,
      autoCreateStatus: channel.supportAutoCreate ? 1 : 0
    }];
    setTimeout(() => {
      formRef.current?.setFieldsValue(defaultChannel);
    });
  }, [visible, channel]);

  if (!channel) {
    return <></>;
  }

  const isEditing = !!channel.reportApiParamsMeta.length;

  return (
    <ModalForm<ISdkChannel>
      formRef={formRef}
      initialValues={channel}
      visible={visible}
      width={570}
      title={`编辑广告网络 - ${channel.adnName}`}
      layout="horizontal"
      onFinish={async (values) => {
        const newValues = {...values};
        newValues.reportApiParams = newValues.reportApiParams.map(item => {
          return {
            ...item,
            status: item.status !== undefined ? +item.status : 1,
            autoCreateStatus: channel.supportAutoCreate ? +item.autoCreateStatus : 0
          };
        });

        await channelDispatcher.updateSdkChannel({
          ...channel,
          ...newValues
        });
        onClose();
        onFinish();
      }}
      modalProps={{
        bodyStyle: { padding: '16px 0' },
        maskClosable: false,
        okText: '提交',
        onCancel: () => {
          onClose();
        },
        afterClose: () => {
          resetForm();
        },
        destroyOnClose: true
      }}
    >
      {/* 2, 3, 5 穿山甲，优量汇，快手； 4，7，9，10 百度，阿里SDK，OPPP SDK，TapTap */}
      {[2, 3, 5, 4, 7, 9, 10].includes(channel.adnId) ? <Alert
        message={sdkReportApiChannels.includes(channel.adnId) ? <>根据账户ID、Key等信息将第三方数据回传，展示在数据报表中</> : <>该广告网络暂不支持三方拉取数据</>}
        type="info"
        showIcon
        banner
        style={{marginBottom: '21px'}}
      /> : <></>}
      <Row className={styles['company-channel-name-row']}>
        <Image src={channelIconMap[channel.adnId]} preview={false} />
        <span className={styles['company-channel-name-text']}>{channel.adnName}</span>
      </Row>
      {
        isEditing ? <>
          <Divider style={{margin: '21px 0'}}/>
          <ProFormList
            name="reportApiParams"
            copyIconProps={false}
            actionRef={actionRef}
            style={{ marginBottom: 0 }}
            creatorButtonProps={
              channel.reportApiParamsMeta.length ? {
                type: 'default',
                className: styles['add-user-channel-btn'],
                block: false,
                creatorButtonText: '账户',
                onClickCapture: () => {
                  const currentList = formRef.current?.getFieldValue('reportApiParams');
                  const newSdkReportApiStatusMap = cloneDeep(sdkReportApiStatusMap);
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  newSdkReportApiStatusMap![currentList.length] = {status: true, autoCreateStatus: channel.supportAutoCreate ? true : false};
                  setSdkReportApiStatusMap(newSdkReportApiStatusMap);
                }
              } : false
            }
            
            actionRender={(field, action) => {
              const reportApiParams: ISdkChannel['reportApiParams'] = formRef.current?.getFieldValue('reportApiParams');
              if (reportApiParams) {
                return [
                  <Popconfirm
                    key="delete"
                    title={(<>各广告网络需要通过Reporting API将数据回传给Blink，<br />删除后Blink将无法再统计到您在此广告网络中产生的真实数据，<br />并将会影响到该账户下自动创建的三方广告源的管理与设置，<br />请谨慎操作！</>)}
                    okText="删除"
                    onConfirm={() => {
                      action.remove(field.name);
                      const currentList = formRef.current?.getFieldValue('reportApiParams');
                      const newSdkReportApiStatusMap = {};
                      currentList.forEach((item, index) => newSdkReportApiStatusMap[index] = {status: !!item.status, autoCreateStatus: !!item.autoCreateStatus});
                      setSdkReportApiStatusMap(newSdkReportApiStatusMap);
                    }}
                  >
                    <Button
                      type="link"
                      icon={<DeleteOutlined style={{color: '#999'}}/>}
                      danger
                    />
                  </Popconfirm>
                ];
              } else {
                return [];
              }
            }}
            itemRender={(dom, listMeta) => (<>
              {listMeta.index > 0 && <Divider />}
              <Row className={styles['sdk-company-channel-row']}>
                <Col flex="1 1 auto">
                  {dom.listDom}
                </Col>
                <Col flex="0 0 80px">
                  {
                    !!formRef.current?.getFieldValue('reportApiParams') && <>
                      {dom.action}
                    </>
                  }
                </Col>
              </Row>
            </>)}
          >
            {(_meta, _index, { getCurrentRowData, setCurrentRowData }) => {
              return (<>
                {
                  channel.reportApiParamsMeta.length > 0 ? <><ProFormText
                    name="name"
                    label="账户名称"
                    labelCol={{ flex: '0 1 120px' }}
                    wrapperCol={{ flex: '1 1 auto' }}
                    rules={[{ required: true, message: '请填写${label}' }]}
                    initialValue={_meta.name == 0 ? channel.adnName : channel.adnName + '_' + _meta.name}
                    required
                    tooltip='用于区分您在该广告网络下的不同账号，平台不做正确性校验'
                    getValueFromEvent={e => e.target.value.trim()}
                  /> 
                  <ProFormSwitch
                    name="status"
                    label="报表API"
                    labelCol={{ flex: '0 1 120px' }}
                    wrapperCol={{ flex: '1 1 auto' }}
                    initialValue={true}
                    fieldProps={{
                      size: 'small',
                      defaultChecked: true,
                      onChange: (value) => {
                        const data = getCurrentRowData();
                        if (!value && !data.autoCreateStatus) {
                          setCurrentRowData({...data, channelParams: {}});
                        }
                        const currentList = formRef.current?.getFieldValue('reportApiParams');
                        const newSdkReportApiStatusMap = {};
                        currentList.forEach((ele, index) => {
                          newSdkReportApiStatusMap[index] = { status: ele.status, autoCreateStatus: ele.autoCreateStatus};
                        });
                        
                        setSdkReportApiStatusMap(newSdkReportApiStatusMap);
                      }
                    }}
                  />
                  {channel.supportAutoCreate ? <ProFormSwitch
                    name="autoCreateStatus"
                    label="自动创建广告源"
                    labelCol={{ flex: '0 1 120px' }}
                    wrapperCol={{ flex: '1 1 auto' }}
                    tooltip={autoCreateStatusTipMap[channel.adnId]}
                    initialValue={channel.supportAutoCreate ? true : false}
                    fieldProps={{
                      size: 'small',
                      onChange: (value) => {
                        const data = getCurrentRowData();
                        if (!value && !data.status) {
                          setCurrentRowData({...data, channelParams: {}});
                        }
                        const currentList = formRef.current?.getFieldValue('reportApiParams');
                        const newSdkReportApiStatusMap = {};
                        
                        currentList.forEach((ele, index) => {
                          newSdkReportApiStatusMap[index] = { status: ele.status, autoCreateStatus: ele.autoCreateStatus};
                        });
                        setSdkReportApiStatusMap(newSdkReportApiStatusMap);
                      }
                    }}
                  /> : <></>}
                  </> : (<></>)
                }
                {sdkReportApiStatusMap && sdkReportApiStatusMap[_index] && (sdkReportApiStatusMap[_index].status || sdkReportApiStatusMap[_index].autoCreateStatus) ?
                  channel.reportApiParamsMeta.map(paramMeta => (
                    <ProFormTextArea
                      key={paramMeta.metaKey}
                      name={['channelParams', paramMeta.metaKey]}
                      labelCol={{ flex: '0 1 120px' }}
                      label={paramMeta.metaName}
                      fieldProps={{
                        rows: 1,
                        allowClear: true,
                        autoSize: { minRows: 1 }
                      }}
                      required={!!paramMeta.metaRequired}
                      rules={[{ required: !!paramMeta.metaRequired, message: '请填写${label}' }]}
                      // 这里去掉的原因是因为加上这个trim 之后不能进行 回车换行
                      //  getValueFromEvent={e => e.target.value.trim()}
                    />)) : (<></>)         
                }
              </>);
            }}
          </ProFormList>
        </> : (<></>)
      }
    </ModalForm>
  );
}

export default ChannelForm;

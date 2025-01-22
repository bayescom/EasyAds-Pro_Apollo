import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Col, Form, Input, Tooltip } from 'antd';
import styles from '../index.module.less';

type Iprops = {
  config: { metaKey: string, metaName: string },
  isSeverHasSaveMetaAppKey: boolean,
  metaAppKeyDisabled: boolean,
  savePervMetaAppKey: string | null,
  setMetaAppKeyDisabled: (value: boolean) => void,
  setSavePervMetaAppKey: (value) => void,
  customColSpan?: number,
  className?: string
}

export default function MetaAppKey({
  config,
  isSeverHasSaveMetaAppKey,
  metaAppKeyDisabled,
  savePervMetaAppKey,
  setMetaAppKeyDisabled,
  setSavePervMetaAppKey,
  customColSpan,
  className
}: Iprops) {
  const form = Form.useFormInstance();

  const handleEditMetaAppKey = () => {
    // 保存输入框之前的值
    const text = form.getFieldValue(['params', 'app_key']);
    if (text) {
      setSavePervMetaAppKey(text.trim());
      setMetaAppKeyDisabled(true);
    } else {
      document.querySelector('#channelParams_meta_app_key_help')?.setAttribute('style', 'opacity: 1');
    }
  };

  const handleCancelEditMetaAppKey = async () => {
    // 处理还原输入框之前的值
    const text = form.getFieldValue(['params', 'app_key']);
    if (text) {
      // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
      if (savePervMetaAppKey) {
        if (text.trim() !== savePervMetaAppKey) {
          form.setFieldValue(['params', 'app_key'], savePervMetaAppKey);
        }
        // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
        setMetaAppKeyDisabled(true);
      }
    } else {
      if (savePervMetaAppKey) {
        form.setFieldValue(['params', 'app_key'], savePervMetaAppKey);
        document.querySelector('#channelParams_meta_app_key_help')?.setAttribute('style', 'opacity: 0');
        // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
        setMetaAppKeyDisabled(true);
      }
    }
  };

  return (<div className={[className ? className : '', styles['meta-app-item-container'] ].join(' ')}>
    {
      isSeverHasSaveMetaAppKey ? <Col span={customColSpan ? customColSpan : 16} key={config.metaKey} className={['meta-app-id-edit', metaAppKeyDisabled ? '' : 'meta-app-id-operation'].join(' ')}>
        {
          metaAppKeyDisabled ? <div className='meta-app-id-info-text meta-app-key-info-text'>
            <span className='meta-app-id-info-label'>{config.metaName || config.metaKey.toUpperCase()}</span>
            <Tooltip title={savePervMetaAppKey && savePervMetaAppKey.length > 25 ? savePervMetaAppKey : false} className={'meta-app-id-info-content'}>{savePervMetaAppKey}</Tooltip>
          </div> :
            <Form.Item
              name={['params', config.metaKey]}
              label={
                <span className='channel-configs-label'>{config.metaName || config.metaKey.toUpperCase()}</span>
              }
              rules={[{ required: true, type: 'string', message: '请输入' }]}
              required={true}
              getValueFromEvent={e => e.target.value.trim()}
              className='meta-app-id-form-item'
            >
              <Input placeholder="请输入"/>
            </Form.Item>
        }
        <div className='meta-app-id-edit-operation'>
          {
            metaAppKeyDisabled ? <span className='meta-app-id-edit-text-item' onClick={() => setMetaAppKeyDisabled(false)}>编辑</span> 
              : <span className='meta-app-id-operation-text-item'>
                <CheckCircleOutlined onClick={() => handleEditMetaAppKey()}/>
                <CloseCircleOutlined onClick={() => handleCancelEditMetaAppKey()}/>
              </span>
          }
        </div>
      </Col> : <Col span={customColSpan ? customColSpan : 16} key={config.metaKey}>
        <Form.Item
          name={['params', config.metaKey]}
          label={
            <span className='channel-configs-label'>{config.metaName || config.metaKey.toUpperCase()}</span>
          }
          rules={[{ required: true, type: 'string', message: '请输入' }]}
          required={true}
          getValueFromEvent={e => e.target.value.trim()}
        >
          <Input placeholder="请输入"/>
        </Form.Item>
      </Col>
    }
  </div>
  );
}

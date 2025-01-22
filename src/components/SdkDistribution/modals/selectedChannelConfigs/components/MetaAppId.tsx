import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Form, Input, Tooltip } from 'antd';
import styles from '../index.module.less';

type Iprops = {
  config: { metaKey: string, metaName: string },
  isSeverHasSaveMetaAppId: boolean,
  metaAppIdDisabled: boolean,
  savePervMetaAppId: string | null,
  setMetaAppIdDisabled: (value: boolean) => void,
  setSavePervMetaAppId: (value) => void,
  customColSpan?: number,
  className?: string
}

export default function MetaAppId({
  config,
  isSeverHasSaveMetaAppId,
  metaAppIdDisabled,
  savePervMetaAppId,
  setMetaAppIdDisabled,
  setSavePervMetaAppId,
  customColSpan,
  className
}: Iprops) {
  const form = Form.useFormInstance();

  const handleEditMetaAppId = () => {
    // 保存输入框之前的值
    const text = form.getFieldValue(['params', 'app_id']);
    if (text) {
      setSavePervMetaAppId(text.trim());
      setMetaAppIdDisabled(true);
    } else {
      document.querySelector('#channelParams_meta_app_id_help')?.setAttribute('style', 'opacity: 1');
    }
  };

  const handleCancelEditMetaAppId = async () => {
    // 处理还原输入框之前的值
    const text = form.getFieldValue(['params', 'app_id']);
    // text存在，但是savePervMetaAppId不存在
    // text不存在， 但是savePervMetaAppId存在
    // text不存在，savePervMetaAppId也不存在
    if (text) {
      // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
      if (savePervMetaAppId) {
        if (text.trim() !== savePervMetaAppId) {
          form.setFieldValue(['params', 'app_id'], savePervMetaAppId);
        }
        // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
        setMetaAppIdDisabled(true);
      }
    } else {
      if (savePervMetaAppId) {
        form.setFieldValue(['params', 'app_id'], savePervMetaAppId);
        document.querySelector('#channelParams_meta_app_id_help')?.setAttribute('style', 'opacity: 0');
        // 只有当之前提交过，或者在当前表单保存过，才能取消编辑
        setMetaAppIdDisabled(true);
      }
    }
  };

  return (<div className={[styles['meta-app-item-container'], className ? className : ''].join(' ')}>
    {
      isSeverHasSaveMetaAppId ? <Col span={customColSpan ? customColSpan : 16} key={config.metaKey} className={['meta-app-id-edit', metaAppIdDisabled ? '' : 'meta-app-id-operation'].join(' ')}>
        {
          metaAppIdDisabled ? <div className={['meta-app-id-info-text', config.metaName !== '媒体ID' ? 'meta-app-id-disable-tooltip' : ''].join(' ')}>
            <span className='meta-app-id-info-label'>
              {config.metaName || config.metaKey.toUpperCase()}
              {config.metaName === '媒体ID' && <Tooltip className='meta-app-id-info-tooltip' title='此媒体ID为您在第三方广告平台创建的媒体/应用ID，请填写在此处'><QuestionCircleOutlined /></Tooltip>}
            </span>
            <Tooltip title={savePervMetaAppId && savePervMetaAppId.length > 25 ? savePervMetaAppId : false} className='meta-app-id-info-content'>{savePervMetaAppId}</Tooltip>
          </div> :
            <Form.Item
              name={['params', config.metaKey]}
              tooltip={config.metaName === '媒体ID' ? '此媒体ID为您在第三方广告平台创建的媒体/应用ID，请填写在此处' : false}
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
            metaAppIdDisabled ? <span className='meta-app-id-edit-text-item' onClick={() => setMetaAppIdDisabled(false)}>编辑</span> 
              : <span className='meta-app-id-operation-text-item'>
                <CheckCircleOutlined onClick={() => handleEditMetaAppId()}/>
                <CloseCircleOutlined onClick={() => handleCancelEditMetaAppId()}/>
              </span>
          }
        </div>
      </Col> : <Col span={customColSpan ? customColSpan : 16} key={config.metaKey}>
        <Form.Item
          name={['params', config.metaKey]}
          tooltip={config.metaName === '媒体ID' ? '此媒体ID为您在第三方广告平台创建的媒体/应用ID，请填写在此处' : false}
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

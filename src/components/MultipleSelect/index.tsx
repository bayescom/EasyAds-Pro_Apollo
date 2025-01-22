import { Empty, Form, Select, Space, Tooltip, Typography, Image, Input, Button } from 'antd';
import { maxTagPlaceholderForCustomSelect, maxTagPlaceholderWithMaker } from '@/components/Utils';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import DefaultIcon from '@/assets/icons/channel/defaultIcon.png';
// adspotType 专用 后期后端有空 可以改为后端返回
import bannerActiveIcon from '@/assets/icons/adspot/bannerActive.png';
import splashActiveIcon from '@/assets/icons/adspot/splashActive.png';
import interstitialActiveIcon from '@/assets/icons/adspot/interstitialActive.png';
import feedActiveIcon from '@/assets/icons/adspot/feedActive.png';
import textActiveIcon from '@/assets/icons/adspot/textActive.png';
import rollActiveIcon from '@/assets/icons/adspot/rollActive.png';
import incentiveActiveIcon from '@/assets/icons/adspot/incentiveActive.png';
import { Rule } from 'antd/lib/form';
import { platformIconMap, mediaIconMap, channelIconMap } from '../Utils/Constant';

type IProps = {
  options: any[],
  label: string,
  name: string,
  /**
   * 取值类型，即id、value，抑或其它
   */
  keyType: string,
  /**
   * 筛选框是否位于最右边
   */
  isRight?: boolean,
  /**
   * 触发请求的方式
   */
  changeFormValue?: () => void,
  /**
   *  是否是媒体筛选, 且必须搭配urlKey使用
   */
  isMedia?: boolean,
  isChannel?: boolean,
  urlKey?: string
  onChange?: () => void,
  /**
   * 父组件用来捕获该子组件change事件的函数
   */
  onChangeCurrentSelect?: (name: string, value?: any) => void,
  /**
   * 是否不显示id或value
   */
  isNoShowIdOrValue?: boolean,
  placeholder?: React.ReactNode,
  hasPlatform?: boolean,
  platformKey?: string,
  notShowSearchInput?: boolean,
  /** 输出与输入类型是否为数组，使用须知：该组件只接受字符串数组，如果需要值为数组，需要将Number数组转为String数组 */
  isValueTypeArray?: boolean,
  rules?: Rule[],
  noStyle?: boolean,
  /** options的值是否可转数字，例：‘100080’类型还是‘huawei’类型， 前者number默认，可以不用写，后者需要写 */
  optionValueType?: 'string' | 'number',
  isDimension?: boolean,
  // 是否隐藏全选和反选
  hideSelectAllAndInvert?: boolean,
}

const adspotTypeImageMap = {
  1: splashActiveIcon,  // 开屏
  2: feedActiveIcon,  // 信息流
  3: bannerActiveIcon,  // 横幅
  4: interstitialActiveIcon,  // 插屏
  5: incentiveActiveIcon,  // 激励视频
  8: textActiveIcon,  // 文字链
  9: rollActiveIcon,  // 视频贴片
  20: interstitialActiveIcon,  // 气泡角标
};

const { Option } = Select;
const { Text } = Typography;

const MultipleSelect: React.FC<IProps> = ({options, label, name, keyType, isRight, changeFormValue, isMedia, onChange, isChannel, onChangeCurrentSelect, isNoShowIdOrValue, placeholder, urlKey, hasPlatform, platformKey, notShowSearchInput, isValueTypeArray, rules, optionValueType, noStyle, isDimension, hideSelectAllAndInvert} : IProps) => {
  const form = Form.useFormInstance();
  const watchFormItem = Form.useWatch(name, form);

  const [rightSelectList, setRightSelectList] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const [customInputValue, setCustomInputValue] = useState<string| undefined>();

  useEffect(() => {
    setFilterOptions(options);
  }, [options]);

  useEffect(() => {
    if (watchFormItem) {
      const dataList = isValueTypeArray ? watchFormItem : watchFormItem.split(',');
      const newRightSelectList = dataList.map(item => {
        const result = options.filter(listItem => {
          return optionValueType ? listItem[keyType] == item : listItem[keyType] == +item;
        });
        return result;
      });

      setRightSelectList(newRightSelectList.flat(2));
    } else {
      setCustomInputValue(undefined);
      setFilterOptions(options);
      setRightSelectList([]);
    }
  }, [watchFormItem, options]);

  useEffect(() => {
    if (watchFormItem != undefined) {      
      onChange && onChange();
    }
  }, [watchFormItem]);

  const clearOption = (key) => {
    const newRightSelectList = [...rightSelectList];
    const index = newRightSelectList.findIndex(item => item[keyType] == key);
    newRightSelectList.splice(index, 1);
    setRightSelectList(newRightSelectList);
    
    if (isValueTypeArray) {
      const newValue = newRightSelectList.map(item => item[keyType]);
      form.setFieldValue(name, newValue);
    } else {
      const newWatchFormItem = watchFormItem.replace(key + '', '').replace(/,(?=,)/g, '').replace(/[&,]$/, '').replace(/^[&,]/, '');
      form.setFieldValue(name, newWatchFormItem ? newWatchFormItem : undefined);
    }
    changeFormValue && changeFormValue();
  };

  const clearAll = () => {
    setRightSelectList([]);
    isValueTypeArray ? form.setFieldValue(name, []) : form.setFieldValue(name, undefined);
    changeFormValue && changeFormValue();
  };

  useState(() => {
    if (options && options.length) {
      setFilterOptions(options);
    }
  });
  
  const handleSearch = (e) => {
    setCustomInputValue(e.target.value);
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = options.filter(item => item[keyType].toString().includes(text)
       || item.name.toString().toLowerCase().includes(text.toLowerCase()));
      setFilterOptions(result);
    } else {
      setFilterOptions(options);
    }
  };

  const handleCustomAll = () => {
    const contrastList = customInputValue ? filterOptions : options;
    // 节流
    if (rightSelectList.length !== contrastList.length) {
      setRightSelectList(contrastList);
      const currentFormItemData = contrastList.map(item => item[keyType]);
      if (isValueTypeArray) {
        currentFormItemData.length ? form.setFieldValue(name, currentFormItemData) : form.setFieldValue(name, []);
      } else {
        currentFormItemData.length ? form.setFieldValue(name, currentFormItemData.toString()) : form.setFieldValue(name, undefined);
      }
      changeFormValue && changeFormValue();
    }
  };

  const handleCustomInvert = () => {
    const contrastList = customInputValue ? filterOptions : options;
    if (rightSelectList.length) {
      if (rightSelectList.length !== contrastList.length) { 
        const currentSelect = isValueTypeArray ? watchFormItem : watchFormItem.split(',');
        const invertList = contrastList.filter(item => !currentSelect.includes(String(item[keyType])));
        const invertListValues = invertList.map(item => item[keyType]);
        setRightSelectList(invertList);
        isValueTypeArray ? form.setFieldValue(name, invertListValues) : form.setFieldValue(name, invertListValues.toString());
      } else {
        setRightSelectList([]);
        isValueTypeArray ? form.setFieldValue(name, []) : form.setFieldValue(name, undefined);
      }
    } else {
      setRightSelectList(contrastList);
      const currentFormItemData = contrastList.map(item => item[keyType]);
      if (isValueTypeArray) {
        currentFormItemData.length ? form.setFieldValue(name, currentFormItemData) : form.setFieldValue(name, []);
      } else {
        currentFormItemData.length ? form.setFieldValue(name, currentFormItemData.toString()) : form.setFieldValue(name, undefined);
      }
    }
    changeFormValue && changeFormValue();
  };

  return (<>
    <Form.Item
      label={label}
      name={name}
      getValueFromEvent={(values: string[]) => isValueTypeArray ? values : values.join(',')}
      getValueProps={outerValue => (isValueTypeArray ? { value: outerValue } : { value: outerValue ? outerValue.split(',') : []})}
      className={styles['form-item']}
      rules={rules}
      noStyle={noStyle}
    >
      <Select
        key={name}
        showSearch={false}
        allowClear
        onChange={() => onChangeCurrentSelect && onChangeCurrentSelect(name, watchFormItem)}
        mode="multiple"
        showArrow={true}
        placeholder={placeholder ? placeholder : '请选择'}
        maxTagCount={isDimension ? 'responsive' : rightSelectList.length > 1 ? 0 : 1}
        maxTagPlaceholder={(omittedValues) => isDimension ? maxTagPlaceholderWithMaker(omittedValues) : maxTagPlaceholderForCustomSelect(omittedValues)}
        placement={isRight ? 'bottomRight' : 'bottomLeft'}
        dropdownRender={(menu) => (<>
          {options.length ? <div className={[styles['select-container'], (isMedia || ['adspotTypes'].includes(name)) ? styles['media-container'] : '', isChannel ? styles['channel-container'] : '', hideSelectAllAndInvert ? styles['hide-select-all'] : ''].join(' ')}>
            <div className={[styles['left-container'], notShowSearchInput ? styles['blank-search-input'] : ''].join(' ')}>
              {!notShowSearchInput &&
                <Input onChange={(e) => handleSearch(e)}
                  className={styles['custom-input']}
                  allowClear 
                  prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                  ref={input => input?.focus()}
                  onKeyDown={(e) => e.stopPropagation()}
                  value={customInputValue}
                />}
              {!hideSelectAllAndInvert && <p className={styles['custom-btn']}>
                <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
                <Button className={styles['custom-btn-invert']} onClick={() => handleCustomInvert()} type='link' disabled={!watchFormItem}>反选</Button>
              </p>}
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
                      {!isNoShowIdOrValue && <span>{item[keyType]}</span>}
                      <span className={[styles['clear-icon'], isNoShowIdOrValue ? styles['channel-clear-icon'] : ''].join(' ')} onClick={() => clearOption(item[keyType])}><CloseOutlined /></span>
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
          <Option key={item[keyType]} value={item[keyType].toString()} label={item.name}>
            <Space size={0} style={{width:'100%', display: 'flex'}} className={(isNoShowIdOrValue && !['adspotTypes'].includes(name)) ? styles['not-show-value'] : ''}>
              {isMedia && platformKey && <Image src={mediaIconMap[item[platformKey]] || DefaultIcon} preview={false} style={{width: '32px', height: 'auto', marginRight: '4px'}}/>}
              {isChannel && keyType && <Image src={channelIconMap[item[keyType]] || DefaultIcon} preview={false} style={{width: '20px', height: 'auto', marginRight: '4px'}}/>}
              {['adspotTypes'].includes(name) && <Image src={adspotTypeImageMap[item.value]} preview={false} style={{width: '28px', height: 'auto', marginRight: '4px'}}/>}
              <Space direction="vertical" size={0}>
                {
                  item.name.length > 9 ? <Tooltip title={item.name} placement='right'>{item.name}</Tooltip>
                    : <>{item.name}</>
                }
                {!isNoShowIdOrValue && <div>
                  {hasPlatform && platformKey && <Image 
                    src={ platformIconMap[item[platformKey]] }
                    style={{ width: '16px', height: '15px', marginTop: -17 }} 
                    preview={false}
                  />}
                  <Text type="secondary">{item[keyType]}</Text>
                </div>}
              </Space>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
  </>);
};

export default MultipleSelect;

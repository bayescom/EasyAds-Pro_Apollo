import store from '@/store';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Tooltip } from 'antd';

type IProps = {
  menu: any,
  options: any[],
  formName: string,
  keyType: string,
  searchInputName: string,
  changeSelect: (name, value) => void,
  setFilterOptions: (value: any[]) => void,
  filterOptions: any[],
  dependentStateKey: string,
  isNotShowRightValue?: boolean
}

const SelectDropdownRender: React.FC<IProps> = ({menu, options, formName,  keyType, searchInputName, changeSelect, setFilterOptions, filterOptions, dependentStateKey, isNotShowRightValue} : IProps) => {
  const channelTrafficListState = store.useModelState('channelTrafficList');
  const form = Form.useFormInstance();
  const [rightSelectList, setRightSelectList] = useState<any[]>([]);
  const formSearch = Form.useWatch(searchInputName, form);
  const [invertDisable, setInvertDisable] = useState(true);

  useEffect(() => {
    if (channelTrafficListState[dependentStateKey] && channelTrafficListState[dependentStateKey].length) {
      const newRightSelectList = channelTrafficListState[dependentStateKey].map(item => {
        return options.filter(listItem =>listItem[keyType] == +item);
      });

      setRightSelectList(newRightSelectList.flat(2));
      setInvertDisable(false);
    } else {
      form.setFieldValue(searchInputName, undefined);
      setFilterOptions(options);
      setRightSelectList([]);
      setInvertDisable(true);
    }
  }, [channelTrafficListState[dependentStateKey]]);
  
  const clearOption = (key) => {
    const newRightSelectList = [...rightSelectList];
    const index = newRightSelectList.findIndex(item => item[keyType] == key);
    newRightSelectList.splice(index, 1);
    setRightSelectList(newRightSelectList);
    
    const newValues = newRightSelectList.map(item => item[keyType]);
    changeSelect(formName, newValues ? newValues : undefined);
  };

  const clearAll = () => {
    setRightSelectList([]);
    changeSelect(formName, undefined);
  };

  const handleSearch = (e) => {
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
    const contrastList = formSearch ? filterOptions : options;
    // 节流
    if (rightSelectList.length !== contrastList.length) {
      setRightSelectList(contrastList);
      const currentFormItemData = contrastList.map(item => item[keyType]);
      currentFormItemData.length ? changeSelect(formName, currentFormItemData) : changeSelect(formName, undefined);
    }
  };

  const handleCustomInvert = () => {
    const contrastList = formSearch ? filterOptions : options;
    if (rightSelectList.length) {
      if (rightSelectList.length !== contrastList.length) { 
        const invertList = contrastList.filter(item => !channelTrafficListState[dependentStateKey].includes(item[keyType]));
        const invertListValues = invertList.map(item => item[keyType]);
        setRightSelectList(invertList);
        changeSelect(formName, invertListValues);
      } else {
        setRightSelectList([]);
        changeSelect(formName, undefined);
      }
    } else {
      setRightSelectList(contrastList);
      const currentFormItemData = contrastList.map(item => item[keyType]);
      currentFormItemData.length ? changeSelect(formName, currentFormItemData) : changeSelect(formName, undefined);
    }
  };

  return (<div className={styles['select-container']}>
    <div className={styles['left-container']}>
      <Form.Item name={searchInputName} noStyle>
        <Input onChange={(e) => handleSearch(e)}
          className={styles['custom-input']}
          allowClear 
          ref={input => input?.focus()}
          autoComplete='off'
          onKeyDown={(e) => e.stopPropagation()}
        />
      </Form.Item>
      <p className={styles['custom-btn']}>
        <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
        <Button className={styles['custom-btn-invert']} onClick={() => handleCustomInvert()} type='link' disabled={!invertDisable}>反选</Button>
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
              {!isNotShowRightValue && <span>{item[keyType]}</span>}
              <span className={[styles['clear-icon'], isNotShowRightValue ? styles['channel-clear-icon'] : ''].join(' ')} onClick={() => clearOption(item[keyType])}><CloseOutlined /></span>
            </li>);
          }) : <></>
        }
      </ul>
    </div>
  </div>);
};

export default SelectDropdownRender;

import store from '@/store';
import { Form, Space, TreeNodeProps, TreeSelect, Typography, Image, Tooltip, Empty, Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.module.less';
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { maxTagPlaceholderForCustomSelect } from '../Utils';

const { Text } = Typography;

type Props = {
  label: string,
  name: string,
  optionList: any[],
  treeNodeValueKey: string,
  treeNodeNameKey: string
  /** @isJump 该组件是否用于接收跳转页面的值 */
  isJump?: boolean,
  onChange?: (value) => void,
}

const treeSelectDispatcher = store.getModelDispatchers('treeSelect');

const TreeSelects: React.FC<Props> = ({label, name, optionList, treeNodeValueKey, treeNodeNameKey, isJump, onChange} : Props) => {
  const treeSelect = store.useModelState('treeSelect');
  const form = Form.useFormInstance();
  const watchFormItem = Form.useWatch(name, form);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const [customInputValue, setCustomInputValue] = useState<string| undefined>();

  useEffect(() => {
    setFilterOptions(optionList);
  }, [optionList]);
  
  useEffect(() => {
    if (watchFormItem && watchFormItem.length) {
      const newRightSelectList = watchFormItem.map(item => {
        return treeSelect[name]?.childrenList.filter(inner => inner[treeNodeValueKey] === +item);
      });

      treeSelectDispatcher.setRightSelectList(name, newRightSelectList.flat(2));
      treeSelectDispatcher.setSelectedList({mapKey: name, data: newRightSelectList.flat(2), formatKey: treeNodeValueKey});
    } else {
      treeSelectDispatcher.setRightSelectList(name, []);
      treeSelectDispatcher.setSelectedList({mapKey: name, data: [], formatKey: treeNodeValueKey});
      treeSelectDispatcher.setMediaKeys(name, []);
      treeSelectDispatcher.setFatherCheckboxStatus(name, {});
      setCustomInputValue(undefined);
      setFilterOptions(optionList);
    }
  }, [watchFormItem, treeSelect[name]?.childrenList]);

  // 获取到treeNode的父节点值的数组，默认要打开的tree列表的TreeExpandedKeys, 以及比对需要的全部二级列表信息
  useEffect(() => {
    const mediaSet = new Set();
    optionList.forEach(item => mediaSet.add(item.value));
    treeSelectDispatcher.setMediaList(name, Array.from(mediaSet));
    treeSelectDispatcher.setTreeExpandedKeys(name, Array.from(mediaSet));
    const childrenList: any[] = [];
    optionList.forEach(item => item.children.forEach(children => childrenList.push(children)));
    treeSelectDispatcher.setChildrenList(name, childrenList);
  }, [optionList]);

  useEffect(() => {
    if (isJump) {
      // 如果是接收跳转页面的值，如果不专门在组件内部再赋一次值，第二次刷新的时候值将为空
      form.setFieldValue (name, watchFormItem.map(item => +item));
    }
  }, [isJump]);

  useState(() => {
    if (optionList && optionList.length) {
      setFilterOptions(optionList);
    }
  });

  // 渲染父节点
  const renderTreeNode = (treeData) => {
    const newTreeData: TreeNodeProps = [];
    treeData.map((item, index) => {
      newTreeData.push({
        value: item[treeNodeValueKey],
        key: item[treeNodeValueKey],
        title: (<div key={item[treeNodeNameKey]}>
          <Image src={item.logoUrl || item.url} preview={false} className={styles['image-container']}/>
          <Space direction="vertical" size={0}>
            <Text className={styles['option-name']}>
              {
                item[treeNodeNameKey].length > 8 ? <Tooltip title={item[treeNodeNameKey]} placement='right'>{item[treeNodeNameKey]}</Tooltip>
                  : <>{item[treeNodeNameKey]}</>
              }
            </Text>
            <div>
              <Text type="secondary">
                {item[treeNodeValueKey]}
              </Text>
            </div>
            {treeSelect[name] && <div className={[styles['checkbox-default'], treeSelect[name].fatherCheckboxStatus[item[treeNodeValueKey]] && treeSelect[name].fatherCheckboxStatus[item[treeNodeValueKey]].checkAll ? styles['checkbox-selected-father'] : ''].join(' ')} style={{marginLeft: '-36px'}}>
              {
                treeSelect[name].fatherCheckboxStatus[item[treeNodeValueKey]] && <>
                  <span className={ treeSelect[name].fatherCheckboxStatus[item[treeNodeValueKey]].indeterminate ? styles['check-indeterminate'] : ''}></span>
                  <CheckOutlined style={{display: 'none'}} className={treeSelect[name].fatherCheckboxStatus[item[treeNodeValueKey]].checkAll ? styles['check-mark'] : ''}/>
                </>
              }
            </div>}
          </ Space>
        </div>),
        children: renderChildren(item.children)
      });
    });
    return newTreeData;
  };

  // 渲染子节点
  const renderChildren = (children) => {
    const newChildrenData: TreeNodeProps = [];
    children.map(item => {
      newChildrenData.push({
        value: item[treeNodeValueKey],
        key: item[treeNodeValueKey],
        title: (<Space direction="vertical" size={0} style={{width:'100%'}} key={item[treeNodeNameKey]}>
          <Text className={styles['option-name']}>
            {
              item[treeNodeNameKey].length > 11 ? <Tooltip title={item[treeNodeNameKey]} placement='right'>{item[treeNodeNameKey]}</Tooltip>
                : <>{item[treeNodeNameKey]}</>
            }
          </Text>
          <Space align='start'>
            <Text type="secondary">
              {item[treeNodeValueKey]}
            </Text>
          </Space>
          <div className={[styles['checkbox-default'], treeSelect[name]?.selectedList.includes(item[treeNodeValueKey]) ? styles['checkbox-selected'] : ''].join(' ')}>
            <CheckOutlined className={styles['check-mark']}/>
          </div>
        </Space>),
      });
    });
    return newChildrenData;
  };

  const clearOption = (key) => {
    const newRightSelectList = [...treeSelect[name].rightSelectList];
    const index = newRightSelectList.findIndex(item => item[treeNodeValueKey] == key);
    newRightSelectList.splice(index, 1);
    treeSelectDispatcher.setRightSelectList(name, newRightSelectList);
    treeSelectDispatcher.setSelectedList({mapKey: name, data: newRightSelectList, formatKey: treeNodeValueKey});
    const newWatchFormItem = newRightSelectList.map(item => item[treeNodeValueKey]);
    if (newWatchFormItem.length) {
      form.setFieldValue(name, newWatchFormItem);
      onChange && onChange(newWatchFormItem);
    } else {
      form.setFieldValue(name, []);
      onChange && onChange([]);
    }
  };

  const clearAll = () => {
    treeSelectDispatcher.setRightSelectList(name, []);
    treeSelectDispatcher.setSelectedList({mapKey: name, data: [], formatKey: treeNodeValueKey});
    form.setFieldValue(name, []);
    onChange && onChange([]);
  };

  // 增删点击的媒体信息
  const clickMediaOption = (inputValue) => {
    const checkedMedia = inputValue.map(item => treeSelect[name]?.mediaList.filter(inner => inner == item));
    
    if (checkedMedia.flat(2).length) {
      const checkedMediaKeys = [...treeSelect[name].mediaKeys];
      if (checkedMediaKeys.indexOf(checkedMedia.flat(2)[0]) >= 0) {
        // 如果checkedMediaKeys拥有点击的父级key，判断子级是否全选，全选删除父级，非全选父级不动
        const rightListKeys = treeSelect[name]?.rightSelectList.map(item => item[treeNodeValueKey]);
        const currentCheckedFatherList = optionList.filter(item => item[treeNodeValueKey] == checkedMedia.flat(2)[0]);
        const currentCheckedChildrenList = new Map();
        currentCheckedChildrenList[checkedMedia.flat(2)[0]] = currentCheckedFatherList[0].children.filter(child => rightListKeys?.includes(child[treeNodeValueKey]));
        if (currentCheckedChildrenList[checkedMedia.flat(2)[0]].length === currentCheckedFatherList[0].children.length) {
          checkedMediaKeys.splice(checkedMediaKeys.indexOf(checkedMedia.flat(2)[0]), 1);
        }
      } else {
        checkedMediaKeys.push(checkedMedia.flat(2)[0]);
      }

      treeSelectDispatcher.setMediaKeys(name, checkedMediaKeys);
      const list: any[] = [];
      
      checkedMediaKeys.forEach(ele => {
        const result = optionList.filter(item => item[treeNodeValueKey] === ele);
        list.push(...result[0].children);
      });
  
      // 比对list和rightSelectList, 拿到不一样的数据
      let contrastArray: any[] = [];
      let newRightSelectList: any[] = [];
      const clickFatherValues: any[] = [];
      for(const key in optionList) {
        const hasClickFatherChildren = optionList[key].children.filter(item => list.find(inner => inner.value == item.value));
        if (hasClickFatherChildren.length) {
          clickFatherValues.push(optionList[key].value);
        }
      }
      
      if (list.length) {
        const listIds = list.map(item => item[treeNodeValueKey]);
        const hasFatherId = clickFatherValues.findIndex(item => item == checkedMedia.flat(2)[0]);
        
        if (hasFatherId >= 0) {
          // 说明在list里找到这个点击的媒体id
          contrastArray = treeSelect[name].rightSelectList.filter(item => listIds.includes(item[treeNodeValueKey]));
          const checkedList = optionList.filter(item => item[treeNodeValueKey] == checkedMedia.flat(2)[0]);
          const checkedKeys = new Set();
          [...checkedList[0].children, ...contrastArray].forEach(item => checkedKeys.add(item[treeNodeValueKey]));
          const result = Array.from(checkedKeys).map(item => treeSelect[name].childrenList.filter(listItem => listItem[treeNodeValueKey] == item));
          newRightSelectList = [...result.flat(2)];

          const newFatherCheckboxStatus = {...treeSelect[name]?.fatherCheckboxStatus};
          newFatherCheckboxStatus[checkedMedia.flat(2)[0]] = {indeterminate: false, checkAll: true};
          treeSelectDispatcher.setFatherCheckboxStatus(name, newFatherCheckboxStatus);
        } else {
          // 说明list里面没有这个媒体列表
          contrastArray = treeSelect[name].rightSelectList.filter(item => listIds.includes(item[treeNodeValueKey]));
          newRightSelectList = contrastArray;

          const newFatherCheckboxStatus = {...treeSelect[name]?.fatherCheckboxStatus};
          newFatherCheckboxStatus[checkedMedia.flat(2)[0]] = {indeterminate: false, checkAll: false};
          treeSelectDispatcher.setFatherCheckboxStatus(name, newFatherCheckboxStatus);
        }
      } else {
        newRightSelectList = [];
        const newFatherCheckboxStatus = {[checkedMedia.flat(2)[0]]: {indeterminate: false, checkAll: false}};
        treeSelectDispatcher.setFatherCheckboxStatus(name, newFatherCheckboxStatus);
      }

      const formValue = newRightSelectList.map(item => item[treeNodeValueKey]);
      form.setFieldValue(name, formValue);
      onChange && onChange(formValue);
    } else {
      if (inputValue.length) {
        const fatherKeys = new Set();
        optionList.forEach(item => {
          item.children.forEach(child => {
            if (inputValue.includes(child[treeNodeValueKey])) {
              fatherKeys.add(item[treeNodeValueKey]);
            }
          });
        });
        treeSelectDispatcher.setMediaKeys(name, Array.from(fatherKeys));
        changeFatherCheckboxStatus({key: fatherKeys, params: inputValue});
        onChange && onChange(inputValue);
      } else {
        treeSelectDispatcher.setFatherCheckboxStatus(name, {});
        onChange && onChange(undefined);
      }
    }
  };

  const changeFatherCheckboxStatus = ({key, params}) => {
    const newFatherCheckboxStatus = {};
    Array.from(key).forEach(ele => {
      const data = optionList.filter(item => item[treeNodeValueKey] == ele)[0].children;
      const dataKeys = data.map(item => item[treeNodeValueKey]);
      const result = dataKeys.filter(item => !params.includes(item));
      if (result.length) {
        newFatherCheckboxStatus[ele as number] = {indeterminate: true, checkAll: false};
      } else {
        newFatherCheckboxStatus[ele as number] = {indeterminate: false, checkAll: true};
      }
    });
    treeSelectDispatcher.setFatherCheckboxStatus(name, newFatherCheckboxStatus);
  };

  const handleSearch = (e) => {
    setCustomInputValue(e.target.value);
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const data = {};
      // 先过滤一遍children
      optionList.forEach(ele => {
        const filterChildrenList = ele.children.filter(item => item[treeNodeValueKey].toString().includes(text) || item[treeNodeNameKey].toString().toLowerCase().includes(text.toLowerCase()));
        if (filterChildrenList.length) {
          data[ele.value] = filterChildrenList;
        }
      });
      // 再过滤一遍father
      optionList.forEach(ele => {
        if (ele[treeNodeValueKey].toString().includes(text) || ele[treeNodeNameKey].toString().toLowerCase().includes(text.toLowerCase())) {
          data[ele.value] = ele.children;
        }
      });
      // 提取fatherKey
      const lastFatherKeys = Object.keys(data).map(item => +item);
      const result: any[] = [];
      optionList.forEach(ele => {
        if (lastFatherKeys.includes(ele.value)) {
          result.push({...ele, children: data[ele.value]});
        }
      });
      setFilterOptions(result);
    } else {
      setFilterOptions(optionList);
    }
  };

  const handleCustomAll = () => {
    // 节流
    if (treeSelect[name]?.rightSelectList.length !== treeSelect[name]?.childrenList.length) {
      treeSelectDispatcher.setRightSelectList(name, treeSelect[name]?.childrenList);
      treeSelectDispatcher.setSelectedList({mapKey: name, data: treeSelect[name]?.childrenList, formatKey: treeNodeValueKey});
      const mediaKeys = optionList.map(item => item.value);
      const newFatherCheckboxStatus = {};
      mediaKeys.forEach(ele => newFatherCheckboxStatus[ele] = {indeterminate: false, checkAll: true});
      treeSelectDispatcher.setMediaKeys(name, mediaKeys);
      treeSelectDispatcher.setFatherCheckboxStatus(name, newFatherCheckboxStatus);
      const currentFormItemData = treeSelect[name]?.childrenList.map(item => item[treeNodeValueKey]);
      if (currentFormItemData && currentFormItemData.length) {
        form.setFieldValue(name, currentFormItemData);
        onChange && onChange(currentFormItemData);
      } else {
        form.setFieldValue(name, undefined);
        onChange && onChange(undefined);
      }
    }
  };

  const handleCustomInvert = () => {
    if (treeSelect[name]?.rightSelectList.length) {
      if (treeSelect[name]?.rightSelectList.length !== treeSelect[name]?.childrenList.length) { 
        const invertList = treeSelect[name]?.childrenList.filter(item => !watchFormItem.includes(item[treeNodeValueKey]));
        const invertListValues = invertList?.map(item => item[treeNodeValueKey]);
        treeSelectDispatcher.setRightSelectList(name, invertList);
        treeSelectDispatcher.setSelectedList({mapKey: name, data: invertList, formatKey: treeNodeValueKey});
        const fatherKeys = new Set();
        optionList.forEach(item => {
          item.children.forEach(child => {
            if (invertListValues?.includes(child[treeNodeValueKey])) {
              fatherKeys.add(item[treeNodeValueKey]);
            }
          });
        });
        treeSelectDispatcher.setMediaKeys(name, Array.from(fatherKeys));
        changeFatherCheckboxStatus({key: fatherKeys, params: invertListValues});
        form.setFieldValue(name, invertListValues);
        onChange && onChange(invertListValues);
      } else {
        treeSelectDispatcher.setRightSelectList(name, []);
        treeSelectDispatcher.setSelectedList({mapKey: name, data: [], formatKey: treeNodeValueKey});
        treeSelectDispatcher.setMediaKeys(name, []);
        treeSelectDispatcher.setFatherCheckboxStatus(name, {});
        form.setFieldValue(name, undefined);
        onChange && onChange(undefined);
      }
    } else {
      treeSelectDispatcher.setRightSelectList(name, optionList);
      treeSelectDispatcher.setSelectedList({mapKey: name, data: optionList, formatKey: treeNodeValueKey});
      const mediaKeys = optionList.map(item => item.value);
      treeSelectDispatcher.setMediaKeys(name, mediaKeys);
      const currentFormItemData = treeSelect[name]?.childrenList.map(item => item[treeNodeValueKey]);
      changeFatherCheckboxStatus({key: mediaKeys, params: currentFormItemData});
      if (currentFormItemData && currentFormItemData.length) {
        form.setFieldValue(name, currentFormItemData);
        onChange && onChange(currentFormItemData);
      } else {
        form.setFieldValue(name, undefined);
        onChange && onChange(undefined);
      }
    }
  };

  return (<>
    <Form.Item
      name={name}
      label={label}
      className={styles['tree-select-item']}
    >
      <TreeSelect 
        treeData={renderTreeNode(filterOptions)}
        showCheckedStrategy={TreeSelect.SHOW_PARENT}
        placeholder="请选择"
        popupClassName={styles['popup-container']}
        multiple
        showArrow
        allowClear
        showSearch={false}
        treeDefaultExpandAll
        treeExpandedKeys={treeSelect && treeSelect[name]?.treeExpandedKeys}
        onTreeExpand={(expandedKeys) => {
          treeSelectDispatcher.setTreeExpandedKeys(name, expandedKeys);
        }}
        maxTagCount={treeSelect[name]?.rightSelectList.length > 1 ? 0 : 1}
        maxTagPlaceholder={(omittedValues) => maxTagPlaceholderForCustomSelect(omittedValues)}
        onChange={(inputValue) => clickMediaOption(inputValue)}
        dropdownRender={(menu) => (<>
          {optionList.length && treeSelect[name] ? <div className={styles['select-container']}>
            <div className={styles['left-container']}>
              <Input onChange={(e) => handleSearch(e)}
                className={styles['custom-input']}
                allowClear 
                prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                ref={input => input?.focus()}
                onKeyDown={(e) => e.stopPropagation()}
                value={customInputValue}
              />
              <p className={styles['custom-btn']}>
                <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
                <span className={styles['custom-btn-invert']} onClick={() => handleCustomInvert()}>反选</span>
                <Button
                  type='link' 
                  className={styles['tree-button']}
                  onClick={() => {
                    treeSelect[name]?.treeExpandedKeys.length ? treeSelectDispatcher.setTreeExpandedKeys(name, []) : treeSelectDispatcher.setTreeExpandedKeys(name, treeSelect[name].mediaList);
                  }}>
                  {treeSelect[name]?.treeExpandedKeys.length ? '全部收起' : '全部展开'}
                </Button>
              </p>
              {menu}
            </div>
            <div className={styles['right-container']}>
              <div className={styles['top-operation']}>
                <span style={{color: '#545454'}}>已选：&nbsp;{treeSelect[name]?.rightSelectList.length}</span>
                <a onClick={() => clearAll()}>清空全部</a>
              </div>
              <ul className={styles['show-select-container']}>
                {
                  treeSelect[name]?.rightSelectList.length ? treeSelect[name]?.rightSelectList.map((item, index) => {
                    return ( <li key={`${item[treeNodeNameKey]}_${index}`}>
                      <p>
                        {
                          item[treeNodeNameKey].length > 14 ? <Tooltip title={item[treeNodeNameKey]} placement='right'>{item[treeNodeNameKey]}</Tooltip>
                            : <>{item[treeNodeNameKey]}</>
                        }
                      </p>
                      <span>{item[treeNodeValueKey]}</span>
                      <span className={styles['clear-icon']} onClick={() => clearOption(item[treeNodeValueKey])}><CloseOutlined /></span>
                    </li>);
                  }) : <></>
                }
              </ul>
            </div>
          </div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles['empty-container']}/>}
        </>
        )}
      />
    </Form.Item>
  </>);
};

export default TreeSelects;

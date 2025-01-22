

import { Button, Empty, Form, Input, Tooltip, TreeSelect } from 'antd';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { maxTagPlaceholder } from '@/components/Utils';
import { locationFastSelectOption, firstTierCity, newFirstTierCity, secondTierCity, thirdTierCity, FourthTierCity, FifthTierCity } from '../Utils/CityLevelTable';
import { CheckCard } from '@ant-design/pro-card';
import CityLevelPartition from './cityLevelPartition';
import { FilterOptionOfValueString } from '@/models/types/common';

type optionList = {
  name: string,
  value: string,
  children: FilterOptionOfValueString[]
}

type Props = {
  formName: string, 
  optionList: optionList[],
  errorMessage: string
  notRequired?: boolean,
  className?: string,
  isLocation?: boolean
};

const fastKeyMap = {
  'one': firstTierCity,
  'newOne': newFirstTierCity,
  'two': secondTierCity,
  'three': thirdTierCity,
  'foure': FourthTierCity,
  'five': FifthTierCity
};

function TargetIngTreeSelect({ formName, optionList, errorMessage, notRequired, className, isLocation }: Props) {
  const [locationList, setLocationList] = useState<FilterOptionOfValueString[]>([]);
  const [noChildrenFatherList, setNoChildrenFatherListFatherList] = useState<string[]>([]);
  const [hasChildrenFatherList, setHasChildrenFatherListFatherList] = useState<string[]>([]);
  const [showRightList, setShowRightList] = useState<FilterOptionOfValueString[]>([]);
  const [treeExpandedKeys, setTreeExpandedKeys] = useState<React.Key[]>([]);
  const [filterOption, setFilterOption] = useState<optionList[]>([]);
  const [checkCardValue, setCheckCardValue] = useState<string[]>([]);

  useEffect(() => {
    if (optionList) {
      setFilterOption(optionList);
    }
  }, [optionList]);

  const form = Form.useFormInstance();
  const watchFormItem = Form.useWatch(formName, form);

  useEffect(() => {
    const locationList: FilterOptionOfValueString[] = [];
    const noChildrenFatherList: string[] = [];
    const hasChildrenFatherList: string[] = [];
    optionList.forEach(item => {
      locationList.push({value: item.value, name: item.name});
      if (item.children.length) {
        hasChildrenFatherList.push(item.value);
        item.children.forEach(child => locationList.push({value: child.value, name: child.name}));
      } else {
        noChildrenFatherList.push(item.value);
      }
    });
    setLocationList(locationList);
    setNoChildrenFatherListFatherList(noChildrenFatherList);
    setHasChildrenFatherListFatherList(hasChildrenFatherList);
  }, [optionList]);

  useEffect(() => {
    if (watchFormItem && watchFormItem.length && locationList.length) {
      const testList = watchFormItem.split(',');  // 字符串includes并非严格匹配，所以需要切数组
      const showRightList = locationList.filter(item => testList.includes(item.value));
      setShowRightList(showRightList);
    } else {
      setShowRightList([]);
    }
  }, [watchFormItem, locationList]);

  const handleSearch = (e) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const data = {};
      // // 先过滤一遍children
      optionList.forEach(ele => {
        const filterChildrenList = ele.children.filter(item =>item.name.toString().toLowerCase().includes(text.toLowerCase()));
        if (filterChildrenList.length) {
          data[ele.value] = filterChildrenList;
        }
      });
      // // 再过滤一遍father
      optionList.forEach(ele => {
        if (ele.name.toString().toLowerCase().includes(text.toLowerCase())) {
          data[ele.value] = ele.children;
        }
      });

      // 提取fatherKey
      const lastFatherKeys = Object.keys(data).map(item => +item);
      const result: any[] = [];
      optionList.forEach(ele => {
        if (lastFatherKeys.includes(+ele.value)) {
          result.push({...ele, children: data[ele.value]});
        }
      });
      setFilterOption(result);
      const resultxpandedKeys = result.map(item => item.value);
      result.length && setTreeExpandedKeys(resultxpandedKeys);
    } else {
      setFilterOption(optionList);
    }
  };

  const handleCustomAll = () => {
    const checkAll: FilterOptionOfValueString[] = [];
    optionList.forEach(item => checkAll.push({name: item.name, value: item.value}));
    setShowRightList(checkAll);
    const checkAllFormValue = checkAll.map(item => item.value);
    form.setFieldValue(formName, checkAllFormValue.toString());
  };

  const handleCustomInvert = () => {
    // 解析：没有children的省份是否被勾选, 有children的省份里面的城市是否都被勾选: 1. 一个也没勾选, 2. 勾选一部分
    if (watchFormItem) {
      const checkedList = watchFormItem.split(',');
      // 没有child且没被勾选的fatherKeyArray 不需要再次进行任何计算，直接留存，开始下一道工序
      const noChildrenFatherListKey = noChildrenFatherList.filter(item => !checkedList.includes(item));
      // 这里获得了有子元素且没被勾选的父key； 注：应该在过滤完子元素后，清除掉里面的重复项
      const hasChildrenFatherListKey = hasChildrenFatherList.filter(item => !checkedList.includes(item));
      // 得到所有有children的数组列表
      const fatherAndChildrenList = optionList.filter(item => item.children.length);
      // 获得当前勾选的子项位置，获取子项被勾选但是没有被勾选齐的fatherKey（但凡全选form value就直接变fatherKey了，所以这里只可能是没被勾选齐）
      const isNotCheckAllFatherKeySet = new Set();
      fatherAndChildrenList.forEach(item => {
        item.children.forEach(ele => {
          // 被选择了
          if(checkedList.includes(ele.value)) {
            isNotCheckAllFatherKeySet.add(item.value);
          }
        });
      });

      // 将没被勾选齐的信息提取出来
      const notCheckAllList = optionList.filter(item => isNotCheckAllFatherKeySet.has(item.value));
      const notCheckAllChildrenList: FilterOptionOfValueString[] = [];  // 这里是未被勾选齐的fatherkey下的未被勾选的child
      notCheckAllList.forEach(item => item.children.forEach(child => {
        if (!checkedList.includes(child.value)) {
          notCheckAllChildrenList.push(child);
        }
      }));

      // 最终计算
      // 有孩子，但孩子没被勾选，自己也没被勾选
      const hasChildrenButUncheckedFatherKey = hasChildrenFatherListKey.filter(item => !isNotCheckAllFatherKeySet.has(item));
      const uncheckedFatherListKey = [...noChildrenFatherListKey, ...hasChildrenButUncheckedFatherKey];  // 最终需要获得信息的父系key
      const uncheckedFatherList: FilterOptionOfValueString[] = [];
      optionList.forEach(item => {
        if (uncheckedFatherListKey.includes(item.value)) {
          uncheckedFatherList.push({name: item.name, value: item.value});
        }
      });

      const resultShowRightList = [...uncheckedFatherList, ...notCheckAllChildrenList];
      const resultFormValue = resultShowRightList.map(item => item.value);
      setShowRightList(resultShowRightList);
      form.setFieldValue(formName, resultFormValue.length ? resultFormValue.toString() : undefined);
    } else {
      const checkAllRightList = optionList.map(item => {return {value: item.value, name: item.name};});
      const checkAllFormValue = checkAllRightList.map(item => item.value).toString();
      setShowRightList(checkAllRightList);
      form.setFieldValue(formName, checkAllFormValue);
    }
  };

  const clearAll = () => {
    form.setFieldValue(formName, undefined);
    setCheckCardValue([]);
  };

  const clearOption = (value) => {
    const result = watchFormItem.split(',').filter(item => item !== value).toString();
    form.setFieldValue(formName, result ? result : undefined);
  };

  const handleFastLocation = (value) => {
    setCheckCardValue(value);
    const list: FilterOptionOfValueString[][] = [];
    if (value.length) {
      value.forEach(item => {
        if (item == 'five') {
          const province =  optionList.map(item => item.name).filter(item => !['香港', '澳门'].includes(item));
          const filterKeys = [...firstTierCity, ...newFirstTierCity, ...secondTierCity, ...thirdTierCity, ...FourthTierCity, ...province];
          // 五线包含五线和五线开外
          const newItem = locationList.filter(location => !filterKeys.includes(location.name));
          list.push(newItem);
        } else {
          const newItem = locationList.filter(location => fastKeyMap[item].includes(location.name));
          list.push(newItem);
        }
      });
    }

    const result = list.flat(2);
    const formValue = result.map(item => item.value);
    setShowRightList(result);
    form.setFieldValue(formName, formValue.toString());
  };
 
  return (<Form.Item
    name={formName}
    getValueFromEvent={(values: string[]) => values.join(',')}
    getValueProps={outerValue => ({ value: outerValue ? outerValue.split(',') : []})}
    noStyle // 这个属性相当于加上了就只返回了select组件，而没有返回ant-form-item这个类名涵盖的一系列formItem的标签
    rules={[{ required: notRequired ? false : true, message: errorMessage }]}
  >
    <TreeSelect
      key={formName}
      className={[styles['location-list'], className ? className : ''].join(' ')}
      treeData={filterOption}
      fieldNames={{ label: 'name' }}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      placeholder="请选择"
      treeCheckable
      multiple
      showArrow
      treeNodeFilterProp='name'
      treeExpandedKeys={treeExpandedKeys}
      onTreeExpand={(expandedKeys) => {
        setTreeExpandedKeys(expandedKeys);
      }}
      maxTagCount='responsive'
      maxTagPlaceholder={(omittedValues) => maxTagPlaceholder(omittedValues)}
      dropdownRender={(menu) => (<>
        {optionList.length ? <div className={[styles['select-container'], isLocation ? styles['location-contianer'] : ''].join(' ')}>
          <div className={styles['left-container']}>
            <Input onChange={(e) => handleSearch(e)}
              className={styles['custom-input']}
              allowClear 
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
              ref={input => {
                setTimeout(function(){
                  input?.focus();
                },100);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <p className={styles['custom-btn']}>
              <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
              <span className={styles['custom-btn-invert']} onClick={() => handleCustomInvert()}>反选</span>
              {isLocation && <Tooltip title={<CityLevelPartition/>}>划分说明</Tooltip>}
              <Button
                type='link' 
                className={styles['tree-button']}
                onClick={() => {
                  treeExpandedKeys.length ? setTreeExpandedKeys([]) : setTreeExpandedKeys([...noChildrenFatherList, ...hasChildrenFatherList]);
                }}>
                {treeExpandedKeys.length ? '全部收起' : '全部展开'}
              </Button>
            </p>
            {isLocation ? 
              <CheckCard.Group
                multiple
                onChange={(value) => handleFastLocation(value)}
                size='small'
                className={styles['location-fast-option']}
                value={checkCardValue}
              >
                {
                  locationFastSelectOption.map((item, index) => (<CheckCard value={item.value} key={index} description={item.name}/>))
                }
              </CheckCard.Group>: <></>}
            {menu}
          </div>
          <div className={styles['right-container']}>
            <div className={styles['top-operation']}>
              <span style={{color: '#545454'}}>已选：&nbsp;{showRightList.length}</span>
              <a onClick={() => clearAll()}>清空全部</a>
            </div>
            <ul className={styles['show-select-container']}>
              {
                showRightList.length? showRightList.map((item, index) => {
                  return ( <li key={`${item}_${index}`}>
                    <p>
                      {
                        item.name.length > 14 ? <Tooltip title={item.name} placement='right'>{item.name}</Tooltip>
                          : <>{item.name}</>
                      }
                    </p>
                    <span className={styles['clear-icon']} onClick={() => clearOption(item.value)}><CloseOutlined /></span>
                  </li>);
                }) : <></>
              }
            </ul>
          </div>
        </div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles['empty-container']}/>}
      </>
      )}
    />
  </Form.Item>);
}

export default TargetIngTreeSelect;

import store, { IRootDispatch } from '@/store';

type ITreeSelect = {
  /**
   * @param 右侧联动展示列表数据
   */
  rightSelectList: any[],
  /**
   * @param 控制列表折叠展开的key数组
   */
  treeExpandedKeys: string[],
  /**
   * @param treeNode 每次点击父节点获取到的父节点value
   */
  mediaKeys: number[],
  /**
   * @param treeNode 父节点value的数组
   */
  mediaList: number[],
  /**
   * @param children 列表
   */
  childrenList: any[],
  selectedList: any[],
  fatherCheckboxStatus: fatherCheckboxStatus
}

type fatherCheckboxStatus = {[X in number]: {indeterminate: boolean, checkAll: boolean}};

const defaultMapState: ITreeSelect = {
  rightSelectList: [],
  treeExpandedKeys: [],
  mediaKeys: [],
  mediaList: [],
  childrenList: [],
  selectedList: [],
  fatherCheckboxStatus: {}
};

type IState =  Partial<{[key in string]: ITreeSelect}>;

const defaultState: IState = {};

export default {
  state: defaultState,

  reducers: {
    setMediaKeys(prevState: IState, mapKey, mediaKeys) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], mediaKeys};
    },

    setMediaList(prevState: IState, mapKey, mediaList) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], mediaList};
    },

    setRightSelectList(prevState: IState, mapKey, rightSelectList) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], rightSelectList};
    },

    setTreeExpandedKeys(prevState: IState, mapKey, treeExpandedKeys) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], treeExpandedKeys};
    },

    setChildrenList(prevState: IState, mapKey, childrenList) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], childrenList};
    },

    setSelectedList(prevState: IState, { mapKey, data, formatKey }) {
      const selectedList = data.map(item => item[formatKey]);
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], selectedList};
    },

    setFatherCheckboxStatus(prevState: IState, mapKey, fatherCheckboxStatus) {
      prevState[mapKey] = {...defaultMapState, ...prevState[mapKey], fatherCheckboxStatus};
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
   

  })
};

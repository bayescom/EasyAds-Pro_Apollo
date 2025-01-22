import versionService from '@/services/version';
import extractSort from '@/services/utils/extractSort';
import store, { IRootDispatch } from '@/store';
import { ICommonMap, ICommonState } from './types/common';
import { IAppVersion } from './types/version';

type IState = ICommonState<IAppVersion> & ICommonMap<IAppVersion> & {
  new: IAppVersion,
  total: number,
};

const defaultValue = {
  mediaId: null,
  name: '',
};

const defaultState: IState = {
  new: defaultValue,
  list: [],
  map: {},
  total: 0,
};

export default {
  state: defaultState,

  reducers: {
    setViewing(prevState: IState, version: IAppVersion) {
      prevState.viewing = version;
    },

    setEditing(prevState: IState, version: IAppVersion) {
      prevState.editing = version;
    },

    setList(prevState: IState, list: IAppVersion[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setTotal(prevState: IState, total: number) {
      prevState.total = total;
    },

    setOne(prevState: IState, version: IAppVersion) {
      const index = prevState.list.findIndex(item => item.id === version.id);
      prevState.list[index] = version;
      prevState.map[version.id] = version;
    },

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
      delete prevState.map[id];
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      const state = store.getModelState('sdkVersion');
      let result = state.list.find(item => item.id === id);
      if (!result) {
        const data = await versionService.getSdkVersionOne(id);
        result = data['sdkver-list'] as IAppVersion;
      }

      dispatchers.sdkVersion.setOne(result);
      return result;
    },

    async getList({ params, sort }) {
      const data = await versionService.getSdkVersionList({
        ...params,
        ...extractSort(sort)
      });

      dispatchers.sdkVersion.setList(data['sdkver-list']);
      dispatchers.sdkVersion.setTotal(data.meta.total);

      return {
        data: data['sdkver-list'],
        total: data.meta.total
      };
    },

    async new(version: IAppVersion) {
      const newData = await versionService.createSdkVersion(version);
      return newData.sdkver;
    },

    async update(version: IAppVersion) {
      const data = await versionService.updateSdkVersion(version);
      dispatchers.sdkVersion.setEditing(data.sdkver);
      dispatchers.sdkVersion.setOne(data.sdkver);
      return data.sdkver;
    },
    
  }),
};

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
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      const state = store.getModelState('appVersion');
      let result = state.list.find(item => item.id === id);
      if (!result) {
        const data = await versionService.getAppVersionOne(id);
        result = data['appver-list'] as IAppVersion;
      }

      dispatchers.appVersion.setOne(result);
      return result;
    },

    async getList({ params, sort }) {
      const data = await versionService.getAppVersionList({
        ...params,
        ...extractSort(sort)
      });

      dispatchers.appVersion.setList(data['appver-list']);
      dispatchers.appVersion.setTotal(data.meta.total);

      return {
        data: data['appver-list'],
        total: data.meta.total
      };
    },

    async new(version: IAppVersion) {
      const newData = await versionService.createAppVersion(version);
      return newData.appver;
    },

    async update(version: IAppVersion) {
      const data = await versionService.updateAppVersion(version);
      dispatchers.appVersion.setEditing(data.appver);
      dispatchers.appVersion.setOne(data.appver);
      return data.appver;
    },
    
  }),
};

import mediumService from '@/services/medium';
import extractSort from '@/services/utils/extractSort';
import store, { IRootDispatch } from '@/store';
import { ICommonMap, ICommonState } from './types/common';
import { IMedium } from './types/medium';

type IState = ICommonState<IMedium> & ICommonMap<IMedium> & {
  new: IMedium,
  total: number | undefined,
  selectedRowKeys: number[]
};

const mediumDefaultValue: IMedium = {
  id: 0,
  platformType: 1,
  platformTypeName: '',
  mediaName: '',
  bundleName: '',
  status: 1,
  createDate: '',
  adspotCount: 0,
  userList: undefined,
};

const defaultState: IState = {
  new: mediumDefaultValue,
  list: [],
  map: {},
  total: 0,
  selectedRowKeys: []
};

export default {
  state: defaultState,

  reducers: {
    setViewing(prevState: IState, medium: IMedium) {
      prevState.viewing = medium;
    },

    setEditing(prevState: IState, medium: IMedium) {
      prevState.editing = medium;
    },

    setList(prevState: IState, {list, total}: {list: IMedium[], total?: number}) {
      prevState.list = list;
      prevState.total = total;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setOne(prevState: IState, medium: IMedium) {
      const index = prevState.list.findIndex(item => item.id === medium.id);
      prevState.list[index] = medium;
      prevState.map[medium.id] = medium;
    },

    setBatchMediums(prevState: IState, mediumList: IMedium[]) {
      mediumList.forEach(medium => {
        const index = prevState.list.findIndex(item => item.id === medium.id);
        prevState.list[index] = medium;
        prevState.map[medium.id] = medium;
      });
    },

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
      delete prevState.map[id];
    },
    
    setSelectedRowKeys(prevState: IState, selectedRowKeys ) {
      prevState.selectedRowKeys = selectedRowKeys;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      const state = store.getModelState('medium');
      let result = state.list.find(item => item.id === id);
      if (!result) {
        const data = await mediumService.getOne(id);
        result = data.media as IMedium;
      }

      dispatchers.medium.setOne(result);
      return result;
    },

    async getViewingOne(id: number) {
      const medium = await dispatchers.medium.getOne(id);
      dispatchers.medium.setViewing(medium);
      return medium;
    },

    async getEditingOne(id: number) {
      const medium = await dispatchers.medium.getOne(id);
      dispatchers.medium.setEditing(medium);
      return medium;
    },

    async getList({ params, sort }) {
      const data = await mediumService.getList({
        ...params,
        ...extractSort(sort)
      });

      dispatchers.medium.setList({list: data.medias, total: data.meta.total});

      return {
        data: data.medias,
        total: data.meta.total
      };
    },

    async new(medium: IMedium) {
      const newMedium = await mediumService.create(medium);
      return newMedium.media;
    },

    async update(medium: IMedium) {
      const data = await mediumService.update(medium);
      dispatchers.medium.setEditing(data.media);
      return data.media;
    },

    async updateStatus({ medium, status }: { medium: IMedium, status: number }) {
      const data = await mediumService.update({
        ...medium,
        status
      });

      dispatchers.medium.setOne(data.media);
    },

    async delete({ id, index }: { id: number, index?: number }) {
      await mediumService.delete(id);
    },

    async updateBatchMediums(mediumList) {
      const data = await mediumService.updateBatch(mediumList);

      dispatchers.medium.setBatchMediums(data);
      return { data };
    },
  }),
};

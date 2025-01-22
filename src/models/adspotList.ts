import adspotService from '@/services/adspot';
import extractSort from '@/services/utils/extractSort';
import store, { IRootDispatch } from '@/store';
import { ICommonState } from './types/common';
import { IAdspot, IAdspotListQueryPayload } from './types/adspotList';

type IState = ICommonState<IAdspot> & {
  new: IAdspot,
  map: Partial<{
    [key in number]: IAdspot 
  }>,
  loadingMap: Partial<{
    [key in number]: boolean
  }>,
  total: number,
  selectedRowKeys: number[]
};

const adspotDefaultValue: IAdspot = {
  id: 0,
  adspotName: '',
  mediaId: 0,
  mediaName: '',
  adspotType: '',
  adspotTypeName: '',
  bundleName: '',
  status: 0,
};

const defaultState: IState = {
  new: adspotDefaultValue,
  list: [],
  map: {},
  loadingMap: {},
  total: 0,
  selectedRowKeys: []
};

export default {
  state: defaultState,

  reducers: {
    setViewing(prevState: IState, adspot: IAdspot) {
      prevState.viewing = adspot;
    },

    setEditing(prevState: IState, adspot: IAdspot) {
      prevState.editing = adspot;
    },

    setList(prevState: IState, list: IAdspot[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setOne(prevState: IState, adspot: IAdspot) {
      const index = prevState.list.findIndex(item => item.id === adspot.id);
      if (index !== -1) {
        prevState.list[index] = adspot;
      }

      prevState.map[adspot.id] = adspot;
    },

    setBatchAdspots(prevState: IState, adspotList) {
      adspotList.forEach(adspot => {
        const index = prevState.list.findIndex(item => item.id === adspot.id);
        if (index !== -1) {
          prevState.list[index] = adspot;
        }
  
        prevState.map[adspot.id] = adspot;
      });
    },

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
    },

    setLoading(prevState: IState, [ id, isLoading ]: [number, boolean]) {
      prevState.loadingMap[id] = !!isLoading;
    },

    setTotal(prevState: IState, total: number) {
      prevState.total = total;
    },

    setSelectedRowKeys(prevState: IState, selectedRowKeys ) {
      prevState.selectedRowKeys = selectedRowKeys;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      const state = store.getModelState('adspotList');
      if (state.map[id]) {
        return;
      }

      if (store.getModelState('adspotList').loadingMap[id]) {
        return;
      }

      dispatchers.adspotList.setLoading([id, true]);
      const data = await adspotService.getOne(id);
      dispatchers.adspotList.setLoading([id, false]);
      const adspot = data.adspots as IAdspot;
      dispatchers.adspotList.setOne(adspot);
    },

    async getViewingOne(id: number) {
      await dispatchers.adspotList.getOne(id);
      const adspot = store.getModelState('adspotList').map[id];
      adspot && dispatchers.adspotList.setViewing(adspot);
    },

    async getEditingOne(id: number) {
      await dispatchers.adspotList.getOne(id);
      const adspot = store.getModelState('adspotList').map[id];
      adspot && dispatchers.adspotList.setEditing(adspot);
    },

    async getList({ params, sort }: IAdspotListQueryPayload) {
      const data = await adspotService.getList({
        ...params,
        status: params.status == -1 ? undefined : params.status,
        ...extractSort(sort)
      });

      dispatchers.adspotList.setList(data.adspots);
      dispatchers.adspotList.setTotal(data.meta.total);

      return {
        data: data.adspots,
        total: data.meta.total
      };
    },

    async updateStatus({ adspot, status }: { adspot: IAdspot, status: boolean }) {
      const data = await adspotService.update({
        ...adspot,
        status: status ? 1 : 0
      });

      dispatchers.adspotList.setOne(data.adspot);
    },

    async delete({ id, index }: { id: number, index: number }) {
      await adspotService.delete(id);
      dispatchers.adspotList.remove({ id, index });
    },

    async updateBatchAdspots(adspotList) {
      const data = await adspotService.updateBatchAdspot(adspotList);

      dispatchers.adspotList.setBatchAdspots(data);
      return { data };
    },
  }),
};

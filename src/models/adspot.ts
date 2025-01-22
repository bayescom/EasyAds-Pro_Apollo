import adspotService from '@/services/adspot';
import store, { IRootDispatch } from '@/store';
import { ICommonState } from './types/common';
import { IAdspot} from './types/adspot';
import { formatPayloadDataFromModal, formatModalDataFromPayload } from '@//pages/Adspot/utils/formatAdspotData';
import { Code } from '@/models/types/code';

type mediumList = {
  id: number,
  name: string,
  platform: number,
  iconUrl: string
};

type IState = ICommonState<IAdspot> & {
  new: IAdspot,
  map: Partial<{
    [key in number]: IAdspot 
  }>,
  loadingMap: Partial<{
    [key in number]: boolean
  }>,
  layoutList: Code [],
  mediumList: mediumList [],
};

const adspotDefaultValue: IAdspot = {
  id: 0,
  adspotName: '',
  status: true,

  //basic
  mediaId: 0,
  integrationType: 0,
  adspotType: 0,

  // 频次控制
  timeout: 0,
  deviceDailyReqLimit: 0,
  deviceDailyImpLimit: 0,
  deviceReqInterval: 0,
};

const defaultState: IState = {
  new: adspotDefaultValue,
  list: [],
  map: {},
  loadingMap: {},
  layoutList: [],
  mediumList: [],
};

export default {
  state: defaultState,

  reducers: {
    setViewing(prevState: IState, adspot: IAdspot) {
      prevState.viewing = adspot;
    },

    setEditing(prevState: IState, adspot: IAdspot) {
      const newAdspot = {...adspot};
      newAdspot.switchFcrequency = newAdspot.deviceDailyReqLimit || newAdspot.deviceDailyImpLimit || newAdspot.deviceReqInterval ? true : false;
      
      prevState.editing = newAdspot;
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

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
    },

    setLoading(prevState: IState, [ id, isLoading ]: [number, boolean]) {
      prevState.loadingMap[id] = !!isLoading;
    },

    setLayoutList(prevState: IState, layoutList: Code[]) {
      prevState.layoutList = layoutList;
    },

    setMediumList(prevState: IState, mediumList: mediumList[]) {
      prevState.mediumList = mediumList;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      dispatchers.adspot.setLoading([id, true]);
      const data = await adspotService.getOne(id);
      dispatchers.adspot.setLoading([id, false]);
      const adspot = data.adspot as IAdspot;
      dispatchers.adspot.setOne(formatModalDataFromPayload(adspot));
      return formatModalDataFromPayload(adspot);
    },

    async getViewingOne(id: number) {
      await dispatchers.adspot.getOne(id);
      const adspot = store.getModelState('adspot').map[id];
      adspot && dispatchers.adspot.setViewing(adspot);
    },

    async getEditingOne(id: number) {
      await dispatchers.adspot.getOne(id);
      const adspot = store.getModelState('adspot').map[id];
      adspot && dispatchers.adspot.setEditing(adspot);
    },

    async new(adspot: IAdspot) {
      const adspotData = formatPayloadDataFromModal(adspot);
      const newAdspot = await adspotService.create(adspotData);
      return newAdspot;
    },

    async update(adspot: IAdspot) {
      const adspotData = formatPayloadDataFromModal(adspot);
      const data = await adspotService.update(adspotData);
      dispatchers.adspot.setEditing(formatModalDataFromPayload(data.adspot));
      return data.adspot;
    },

    async getLayoutList() {
      const layoutListData = await adspotService.getLayoutList();
      dispatchers.adspot.setLayoutList(layoutListData['code-list']);
      return layoutListData['code-list'];
    },
  }),
};

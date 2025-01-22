import versionService from '@/services/version';
import store, { IRootDispatch } from '@/store';
import { IVersion, VersionType } from './types/version';

type IState = {
  app: {
    [key in number]: IVersion[]
  },
  sdk: {
    [key in number]: IVersion[]
  }
}

const defaultState:IState = {
  app: {},
  sdk: {}
};

export default {
  state: defaultState,

  reducers: {
    setList(prevState: IState, { mediumId, list, type }: {
      mediumId: number,
      list: IVersion[],
      type: VersionType
    }) {
      prevState[type][mediumId] = list;
    }
  },

  effects: (dispatch: IRootDispatch) => ({
    async getVersionList({ mediumId, type }: { mediumId: number, type: VersionType }) {
      const requestMap = {
        app: versionService.getAppVersion,
        sdk: versionService.getAdvanceSdkVersion
      };

      const versionList: IVersion[] = await requestMap[type](mediumId);
      dispatch.version.setList({ mediumId, list: versionList, type });
      return versionList;
    }
  }),
};

import { routerPermissions } from '@/Layouts/utils';
import tokenService from '@/services/token';
import { IRootDispatch } from '@/store';
import { RouterList, User } from './types/token';

type IState = {
  user: User,
  routerList: RouterList[]
};

const defaultUser = {
  id: null,
  userName: '',
  roleType: 0,
  nickName: '',
  roleTypeName: '',
  status: 0,
};

const defaultValue: IState = {
  user: defaultUser,
  routerList: []
};

export default {
  state: defaultValue,

  reducers: {
    updateUser(prevState: IState, user: User) {
      prevState.user = user;
    },

    updateRouterList(prevState: IState, routerList) {
      prevState.routerList = routerList;
    },
  },

  effects: (dispatch: IRootDispatch) => ({
    async login({ username, password, rememberMe }: { username: string, password: string, rememberMe: boolean }) {
      const data = await tokenService.getToken(username, password);
      if (rememberMe) {
        await localStorage.setItem('user', JSON.stringify(data.user));
      }

      dispatch.token.updateUser(data.user);
      dispatch.token.updateRouterList(routerPermissions);
    },

    async initFromLocalStorage() {
      const user = await localStorage.getItem('user');

      if (user) {
        dispatch.token.updateUser(JSON.parse(user));
        dispatch.token.updateRouterList(routerPermissions);
      }
    },

    async logout() {
      await localStorage.removeItem('user');
      await sessionStorage.removeItem('commonDateType');

      dispatch.token.updateUser(defaultUser);
      dispatch.token.updateRouterList([]);
    },
  }),
};

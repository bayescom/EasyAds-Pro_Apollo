import userService from '@/services/user';
import extractSort from '@/services/utils/extractSort';
import store, { IRootDispatch } from '@/store';
import { ICommonMap, ICommonState } from './types/common';
import { IUser, IUserListQueryPayload } from './types/user';

type IState = ICommonState<IUser> & ICommonMap<IUser> & {
  new: IUser,
  userRoleTypeList: any
};

const userDefaultValue: IUser = {
  id: 0,
  roleName: '',
  userName: '',
  status: 1,
  password: '',
  nickName: '',
  roleType: undefined
};

const defaultState: IState = {
  new: userDefaultValue,
  list: [],
  map: {},
  userRoleTypeList: null
};

export default {
  state: defaultState,

  reducers: {
    setViewing(prevState: IState, user: IUser) {
      prevState.viewing = user;
    },

    setEditing(prevState: IState, user: IUser) {
      prevState.editing = user;
    },

    setList(prevState: IState, list: IUser[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setOne(prevState: IState, user: IUser) {
      const index = prevState.list.findIndex(item => item.id === user.id);
      prevState.list[index] = user;
      prevState.map[user.id] = user;
    },

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
      delete prevState.map[id];
    },

    setUserRoleTypeList(prevState: IState, userRoleTypeList) {
      prevState.userRoleTypeList = userRoleTypeList;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getOne(id: number) {
      const state = store.getModelState('user');
      let result = state.list.find(item => item.id === id);
      if (!result) {
        const data = await userService.getOne(id);
        result = data.media as IUser;
      }

      dispatchers.user.setOne(result);
      return result;
    },

    async getViewingOne(id: number) {
      const user = await dispatchers.user.getOne(id);
      dispatchers.user.setViewing(user);
      return user;
    },

    async getEditingOne(id: number) {
      const user = await dispatchers.user.getOne(id);
      dispatchers.user.setEditing(user);
      return user;
    },

    async getList({ params, sort }: IUserListQueryPayload) {
      const data = await userService.getList({
        ...params,
        ...extractSort(sort)
      });

      dispatchers.user.setList(data.users);

      return {
        data: data.users,
        total: data.meta.total
      };
    },

    async new(user: IUser) {
      const newUser = await userService.create(user);
      return newUser.user;
    },

    async update(user: IUser) {
      const data = await userService.update(user);
      dispatchers.user.setEditing(data.media);
      return data.user;
    },

    async updateStatus({ user, status }: { user: IUser, status: number }) {
      await userService.updateStatus({
        userId: user.id,
        status
      });

      dispatchers.user.setOne({
        ...user,
        status
      });
    },

    async updatePassword(user: IUser) {
      const data = await userService.updatePassword({
        userId: user.id,
        password: user.password
      });

      dispatchers.user.setOne({
        ...user,
        password: user.password
      });
      return data;
    },

    async delete({ id, index }: { id: number, index: number }) {
      await userService.delete(id);
      dispatchers.user.remove({ id, index });
    },

    async getUserRoleType(userRoleType) {
      const data =  await userService.getUserRoleType(userRoleType);
      dispatchers.user.setUserRoleTypeList(data['code-list']);
      return data['code-list'];
    }
  }),
};

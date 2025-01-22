import { ListQueryPayload as CommonListQueryPayload } from './common';

interface IUser {
  id?: number,
  roleName?: string,
  userName?: string,
  nickName?: string,
  status?: number,
  password: string,
  roleType?: number
}

type SortKey = 'id';
type UserFilter = {
  searchText: string,
  roleType: number,
  userRoleType: number
};

type IUserListQueryPayload = CommonListQueryPayload<UserFilter, SortKey>;

export { IUser, SortKey, UserFilter, IUserListQueryPayload };

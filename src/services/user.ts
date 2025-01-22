import { IUser } from '@/models/types/user';
import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getOne(id) {
    return await request.get(`/user/${id}`, {
      instanceName: 'luna'
    });
  },

  async getList(params) {
    return await request.get('/user/users', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async create(user: IUser) {
    user.status = 1;
    return await request.post('/user/', { user }, {
      instanceName: 'luna'
    });
  },

  async update(user: IUser) {
    return await request({
      method: 'PUT',
      url: `/user/${user.id}`,
      data: { user },
      instanceName: 'luna'
    });
  },

  async updateStatus({ userId, status } : { userId: number, status: number }) {
    return await request({
      method: 'PUT',
      url: `/user/status/${userId}`,
      data: {
        status
      },
      instanceName: 'luna'
    });
  },

  async updatePassword({ userId, password } : { userId: number, password: string }) {
    return await request({
      method: 'PUT',
      url: `/user/password/${userId}`,
      data: {
        password
      },
      instanceName: 'luna'
    });
  },

  async delete(userId: number) {
    await request.delete(`/user/${userId}`, {
      instanceName: 'luna'
    });
  },

  async getUserRoleType(userRoleType) {
    return await request.get(`/user/role_type?userRoleType=${userRoleType}`, {
      instanceName: 'luna'
    });
  },
};

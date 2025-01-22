import { request } from 'ice';

export default {
  async getToken(username: string, password: string) {
    return await request({
      method: 'GET',
      url: '/user/login',
      auth: {
        username,
        password
      },
      instanceName: 'luna'
    });
  }
};

import { request } from 'ice';
import { CodeType } from '@/models/types/code';

const codeQuery = {
  platform_type: async () => request.get('/media/platform', {
    instanceName: 'luna'
  }),
  layout: async () => request.get('/adspot/type', {
    instanceName: 'luna'
  }),
  template: async () => request.get('/adspot/template', {
    instanceName: 'luna'
  }),
  versionOperator: () => ({
    'code-list': [
      { value: '>=', name: '>=' },
      { value: '<=', name: '<=' },
      { value: '', name: '包含' },
      { value: '!', name: '排除' }
    ]
  }),
 
  role_type: async () => request.get('/role/type', {
    instanceName: 'luna'
  }),
};

export default {
  async getList(code: CodeType) {
    if (codeQuery[code]) {
      return codeQuery[code]();
    }

    return request.get('/code-lists', {
      params: {
        type: code
      }
    });
  },
};

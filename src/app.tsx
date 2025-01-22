import { config, runApp, IAppConfig, request } from 'ice';
import { ConfigProvider, message, Spin } from 'antd';
import store from '@/store';
import qs from 'qs';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';
moment.locale('zh-cn');
import zhCN from 'antd/es/locale/zh_CN';

type Canceler = { cancel: {(message?: string): void}; url: string; }

// 创建一个请求队列 取消掉请求之前的重复请求
const pending: Canceler[] = [];
const CancelToken = request.CancelToken;
const removePending = (config) => {
  for (const p in pending) {
    if (pending[p].url === config.url + '&' + config.method) {
      pending[p].cancel('request canceled');
      pending.splice(+p, 1);
    }
  }
};

const requestOnConfig = config => {
  if (!config.headers) {
    config.headers = {};
  }
 
  removePending(config);
  config.cancelToken = new CancelToken((c) => {
    pending.push({ cancel: c, url: config.url + '&' + config.method });
  });

  return config;
};

const requestOnError = error => {
  if (!error.response) {
    if (error.message !=='request canceled') {
      message.error('请求出错');
    }
  } else if (error.response.status === 401) {
    store.getModelDispatchers('token').logout();
  } else if (error.response.status === 403) {
    // 没有权限的用户不能登录且清空本地存储
    message.error(error.response.data?.message);
    store.getModelDispatchers('token').logout();
  } else if (error.response.status >= 400) {
    message.error(error.response.data?.message || '客户端错误');
  } else if (error.response.status >= 500) {
    message.error(error.response.data?.message || '服务器内部错误');
  }
  return Promise.reject(error);
};

const responseOnConfig = response => {
  removePending(response.config);
  return response;
};

const appConfig: IAppConfig = {
  app: {
    rootId: 'apollo',
    getInitialData: async () => {
      const dispatchers = store.getModelDispatchers('token');
      await dispatchers.initFromLocalStorage();
      return { ...store.getModelState('token') };
    },
    addProvider: ({ children }) => <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
  },
  router: {
    type: 'browser',
    fallback: <Spin spinning={true} size='large' style={{padding: '20% 50%'}}></Spin>
  },
  request: [
    {
      baseURL: config.luna,
      instanceName: 'luna',
      interceptors: {
        request: { onConfig: requestOnConfig },
        response: { onConfig: responseOnConfig, onError: requestOnError}
      },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'comma' })
    }
  ],
};

runApp(appConfig);
